// @flow
import {KindError} from "./kind-error.js";

/**
 * Get the original stack trace for the given error.
 */
export const getOriginalStackFromError = (error: Error): string => {
    if (error instanceof KindError) {
        return error.originalStack;
    }
    return error.stack;
};
