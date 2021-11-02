// @flow
import {KindError} from "./kind-error.js";
import {Errors} from "./errors.js";

/**
 * Get the kind for the given error.
 */
export const getKindFromError = (error: Error): string => {
    if (error instanceof KindError) {
        return error.kind;
    }
    return Errors.Unknown;
};
