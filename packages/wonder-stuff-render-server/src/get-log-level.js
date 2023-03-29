// @flow
import type {LogLevel} from "@khanacademy/wonder-stuff-server";

/**
 * Determine the level at which to log.
 *
 * This will use the value of the KA_LOG_LEVEL environment variable, if
 * available; otherwise, defaults to "debug".
 */
export const getLogLevel = (): LogLevel => {
    const maybeLogLevel = process.env.KA_LOG_LEVEL;
    switch (maybeLogLevel) {
        case "silly":
        case "debug":
        case "verbose":
        case "info":
        case "warn":
        case "error":
            return maybeLogLevel;

        default:
            return "debug";
    }
};
