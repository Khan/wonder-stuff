// @flow
import stream from "stream";
import winston from "winston";
import * as lw from "@google-cloud/logging-winston";
import type {Transport, NpmLogLevels, Format} from "winston";

import {Errors} from "./errors.js";
import {getGatewayInfo} from "./get-gateway-info.js";
import type {Runtime, Logger, LogLevel, Info} from "./types.js";

/**
 * This is how the log message gets formatted.
 *
 * We can expand this to include additional metadata as needed. For example,
 * if we have the profiling API from react-render-server, we could include
 * the duration metadata.
 */
const devFormatter = ({level, message, ...metadata}: Info): string => {
    const metadataString =
        metadata == null || Object.keys(metadata).length === 0
            ? ""
            : ` ${JSON.stringify(metadata, null, 4)}`;
    return `${level}: ${message}${metadataString}`;
};

/**
 * Build the formatters to give us some nice dev output.
 */
const getFormatters = (mode: Runtime): Format => {
    const formatters: Array<Format> = [
        winston.format.splat(), // Allows for %s style substitutions
    ];
    if (mode === "development") {
        formatters.push(winston.format.cli({level: true}));
    }

    /**
     * This must be added after the cli formatter if it is to be used in
     * the dev output.
     */
    formatters.push(winston.format.printf((info: any) => devFormatter(info)));
    return winston.format.combine(...formatters);
};

/**
 * Gets the logging transport for the given mode.
 */
const getTransport = (mode: Runtime, logLevel: LogLevel): Transport => {
    switch (mode) {
        /**
         * Our flow types guard against misuse as long as someone is using them.
         * Let's be defensive and cope with a bad value. In that case, we'll
         * assume our test mode as it's the most inert.
         */
        default:
        case "test":
            /**
             * During testing, we just dump logging.
             * This avoids storing it anywhere and keeps it out of our
             * test output.
             * To do this, we use a stream that just writes to nowhere.
             *
             * If you want to test logging, you can jest.spy on the logger's
             * log method, or any other of its more specific logging methods.
             */
            const sink = new stream.Writable({write: () => {}});
            /**
             * This is a hack to make our writable stream work
             */
            // $FlowFixMe[cannot-write]
            // $FlowFixMe[method-unbinding]
            sink._write = sink.write;
            return new winston.transports.Stream({
                format: getFormatters("test"),
                stream: sink,
            });

        case "development":
            /**
             * If we're in dev mode, just use a console transport.
             */
            return new winston.transports.Console({
                format: getFormatters("development"),
            });

        case "production":
            /**
             * We must be in production, so we will use the Stackdriver logging
             * setup.
             *
             * The Google-provided logging-winston middleware, which adds a log
             * property to the express request, looks for this transport before
             * adding its own (if it didn't, we would get double logging of
             * each message we logged).
             */
            return new lw.LoggingWinston({
                level: logLevel,
            });
    }
};

/**
 * Get default metadata to attach to logs.
 */
export const getDefaultMetadata = (): {...} => {
    const {instance, pid} = getGatewayInfo();
    return {
        instanceID: instance,
        processID: pid,
    };
};

/**
 * Create a logger for the given runtime mode and log level.
 */
export const createLogger = (
    runtimeMode: Runtime,
    logLevel: LogLevel,
): Logger => {
    const winstonLogger = winston.createLogger<NpmLogLevels>({
        level: logLevel,
        transports: getTransport(runtimeMode, logLevel),
        format: winston.format((info) => {
            // Let's make sure that errors reported without a taxonomic
            // label get labelled.
            if (info.level === "error" && info.kind == null) {
                info.kind = Errors.Internal;
            }
            return info;
        })(),
        defaultMeta: getDefaultMetadata(),
    });

    winstonLogger.debug(
        `Created logger (Level=${logLevel} Mode=${runtimeMode})`,
    );

    return winstonLogger;
};
