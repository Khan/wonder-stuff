// @flow
import {NormalizedErrorInfo} from "./normalized-error-info.js";
import type {NormalizedErrorInfo as INormalizedErrorInfo} from "./types.js";

/**
 * Get a normalized stack trace from an error.
 *
 * @param {Error} error The error to be normalized.
 * @param {number} [stripFrames] The number of stack frames to drop from
 * the top of the stack. Defaults to `0`.
 * @param {number} [minimumFrameCount] The number of stack frames to keep
 * as a minimum. This overrides the `stripFrames` value and defaults to `1`.
 */
export const getNormalizedErrorInfo = (
    error: Error,
    stripFrames: number = 0,
    minimumFrameCount: number = 1,
): INormalizedErrorInfo => {
    // Verify our arguments as needed.
    if (!(error instanceof Error)) {
        throw new Error("Error must be an instance of Error");
    }
    if (stripFrames < 0) {
        throw new Error("stripFrames must be >= 0");
    }
    if (minimumFrameCount < 0) {
        throw new Error("minimumFrameCount must be >= 0");
    }

    // We split the error information into the message and the stack frames.
    const fullErrorMessage = error.toString();

    // The normalized message is just the first line of the error.
    const normalizedMessage =
        fullErrorMessage
            .toString()
            .split("\n")
            .find((l) => l.trim().length) ?? "(empty message)";

    // OK, get the stack without the error message (unless they are the same).
    const stackWithoutMessage =
        error.stack?.startsWith(fullErrorMessage) &&
        error.stack !== fullErrorMessage
            ? error.stack.substring(fullErrorMessage.length)
            : error.stack ?? "";

    // Now split those frames into individual frame lines, filtering
    // out any lines that are solely whitespace.
    const stackFrames = stackWithoutMessage
        .split("\n")
        .filter((s) => s.trim().length);

    // Calculate the real number of frames we strip, taking into account
    // the minimum number of frames we want.
    const actualStripFrames =
        stackFrames.length >= stripFrames + minimumFrameCount ? stripFrames : 0;

    return new NormalizedErrorInfo(
        normalizedMessage,
        stackFrames.slice(actualStripFrames),
    );
};
