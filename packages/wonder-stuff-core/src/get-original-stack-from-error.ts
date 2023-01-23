import {KindError} from "./kind-error";

/**
 * Get the original stack trace for the given error.
 */
export const getOriginalStackFromError = (error: Error): string => {
    if (error instanceof KindError) {
        return error.originalStack;
    }
// @ts-expect-error - TS2322 - Type 'string | undefined' is not assignable to type 'string'.
    return error.stack;
};
