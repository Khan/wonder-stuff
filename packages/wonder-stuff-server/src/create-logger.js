// @flow
import winston from "winston";
import type {NpmLogLevels} from "winston";

import {Errors} from "./errors.js";
// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "./types.js";
import type {LoggingOptions, Logger} from "./types.js";

import {getLoggingTransport} from "./get-logging-transport.js";
import {getRuntimeMode} from "./get-runtime-mode.js";

/**
 * Create a logger with the given options.
 */
export const createLogger = ({
    level,
    defaultMetadata,
    mode,
    transport,
}: LoggingOptions): Logger => {
    mode = mode ?? getRuntimeMode(Runtime.Production);
    const winstonLogger = winston.createLogger<NpmLogLevels>({
        level,
        transports: transport ?? getLoggingTransport(mode, level),
        format: winston.format((info) => {
            // Let's make sure that errors reported without a taxonomic
            // label get labelled.
            if (info.level === "error" && info.kind == null) {
                info.kind = Errors.Internal;
            }
            return info;
        })(),
        defaultMeta: defaultMetadata,
    });

    winstonLogger.debug(
        `Created logger (Level=${level} Mode=${(mode: string)})`,
    );

    return winstonLogger;
};
