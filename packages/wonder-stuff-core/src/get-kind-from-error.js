// @flow
import {KindError} from "./kind-error";
import {Errors} from "./errors";

/**
 * Get the kind for the given error.
 */
export const getKindFromError = (error: Error): string => {
    if (error instanceof KindError) {
        return error.kind;
    }
    return Errors.Unknown;
};
