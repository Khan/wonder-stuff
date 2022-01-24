// @flow
import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "./errors.js";
import type {Logger} from "./types.js";

let rootLogger: ?Logger = null;

/**
 * Get the root-level logger.
 */
export const getRootLogger: () => ?Logger = () => rootLogger;

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
