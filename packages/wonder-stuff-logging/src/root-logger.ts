import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {Logger} from "./types";

let rootLogger: Logger | null | undefined = null;

/**
 * Get the root-level logger.
 */
export const getRootLogger: () => Logger | null | undefined = () => rootLogger;

/**
 * Set the root-level logger.
 */
export const setRootLogger: (logger: Logger) => void = (logger) => {
    if (rootLogger != null) {
        throw new KindError(
            "Root logger already set. Can only be set once per gateway.",
            Errors.Internal,
        );
    }
    rootLogger = logger;
};
