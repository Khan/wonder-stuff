import winston from "winston";
// @ts-expect-error [FEI-5011] - TS2305 - Module '"winston"' has no exported member 'NpmLogLevels'.
import type {NpmLogLevels} from "winston";

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
    // @ts-expect-error [FEI-5011] - TS2558 - Expected 0 type arguments, but got 1.
    const winstonLogger = winston.createLogger<NpmLogLevels>({
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
        // @ts-expect-error [FEI-5011] - TS2731 - Implicit conversion of a 'symbol' to a 'string' will fail at runtime. Consider wrapping this expression in 'String(...)'.
        `Created logger (Level=${level} Mode=${mode as string})`,
    );

    return winstonLogger;
};
