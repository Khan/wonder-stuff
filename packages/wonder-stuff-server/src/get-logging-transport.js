// @flow
import stream from "stream";
import winston from "winston";
import type {Transport, Format} from "winston";

import {Runtime} from "./types";
import type {LogLevel, Info} from "./types";

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
const getFormatters = (mode: $Values<typeof Runtime>): Format => {
    const formatters: Array<Format> = [
        winston.format.splat(), // Allows for %s style substitutions
    ];
    if (mode === Runtime.Development) {
        formatters.push(winston.format.cli({level: true}));
    }

    /**
     * This must be added after the cli formatter if it is to be used in
     * the dev output.
     */
    // $FlowIgnore[prop-missing]
    formatters.push(winston.format.printf((info) => devFormatter(info)));
    return winston.format.combine(...formatters);
};

/**
 * Gets the logging transport for the given mode.
 */
export const getLoggingTransport = (
    mode: $Values<typeof Runtime>,
    logLevel: LogLevel,
): Transport => {
    switch (mode) {
        /**
         * Our flow types guard against misuse as long as someone is using them.
         * Let's be defensive and cope with a bad value. In that case, we'll
         * assume our test mode as it's the most inert.
         */
        // $FlowIgnore[invalid-exhaustive-check]
        default:
        case Runtime.Test:
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
                format: getFormatters(Runtime.Test),
                stream: sink,
            });

        case Runtime.Production:
        case Runtime.Development:
            /**
             * If we're in dev or prod mode, just use a console transport.
             */
            return new winston.transports.Console({
                format: getFormatters(mode),
            });
    }
};
