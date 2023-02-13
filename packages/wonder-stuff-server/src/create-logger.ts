import winston from "winston";

import {Errors} from "./errors";
import type {LoggingOptions, Logger} from "./types";

import {getLoggingTransport} from "./get-logging-transport";

/**
 * Create a logger with the given options.
 */
export const createLogger = ({
    mode,
    level,
    defaultMetadata,
    transport,
}: LoggingOptions): Logger => {
    const winstonLogger = winston.createLogger({
        level,
        transports: transport ?? getLoggingTransport(mode, level),
        format: winston.format((info) => {
            // Let's make sure that errors reported without a taxonomic
            // label get labelled.
            if (info.level === "error" && info.kind == null) {
                info.kind = Errors.Unknown;
            }
            return info;
        })(),
        defaultMeta: defaultMetadata,
    });

    winstonLogger.debug(
        `Created logger (Level=${level} Mode=${mode as string})`,
    );

    return winstonLogger;
};
