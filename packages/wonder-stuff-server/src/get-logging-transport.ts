import stream from "stream";
import * as winston from "winston";
import type {transport as Transport, Logform} from "winston";

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
const getFormatters = (
    mode: (typeof Runtime)[keyof typeof Runtime],
): Logform.Format => {
    const formatters: Array<Logform.Format> = [
        winston.format.splat(), // Allows for %s style substitutions
    ];
    if (mode === Runtime.Development) {
        formatters.push(winston.format.cli({level: true}));
    }

    /**
     * This must be added after the cli formatter if it is to be used in
     * the dev output.
     */
    formatters.push(winston.format.printf((info) => devFormatter(info)));
    return winston.format.combine(...formatters);
};

/**
 * Gets the logging transport for the given mode.
 */
export const getLoggingTransport = (
    mode: (typeof Runtime)[keyof typeof Runtime],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    logLevel: LogLevel,
): Transport => {
    switch (mode) {
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
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const sink = new stream.Writable({write: () => {}});
            /**
             * This is a hack to make our writable stream work
             */
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
