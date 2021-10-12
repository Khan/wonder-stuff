// @flow
import {buildCausedByMessage} from "./build-caused-by-message.js";
import {NormalizedErrorInfo} from "./normalized-error-info.js";

import type {NormalizedErrorInfo as INormalizedErrorInfo} from "./types.js";

/**
 * Combine the stack of the error that caused this one.
 *
 * This combines the stack of another error into this one, creating a new
 * stack trace that incorporates the frames of both errors to tell a deeper
 * story of what happened.
 *
 * For example, some work is done and error A gets thrown, this is caught
 * and ultimately wrapped by error B, which then gets thrown. By combining
 * the stack traces of both error A and B we can get a better idea of what
 * happened, which can be especially useful in asynchronous code.
 *
 * Stack traces are combined such that common frames are deduped, and then
 * at the point of the original throw of error A (i.e. error A's top stack
 * frame), the deduped trace of error B is inserted to show what happened
 * after the error was caught.
 */
export const combineErrorWithCause = (
    consequence: INormalizedErrorInfo,
    cause: INormalizedErrorInfo,
): INormalizedErrorInfo => {
    const combinedStackFrames = [];
    const stackFramesA = cause.stack;
    const stackFramesB = consequence.stack;

    // Shared stack frames will be at the bottom of each stack of frames.
    let indexA = stackFramesA.length - 1;
    let indexB = stackFramesB.length - 1;

    // Now we iterate both stacks, tracking the frames that exist in both.
    while (
        indexA >= 0 &&
        indexB >= 0 &&
        stackFramesA[indexA] === stackFramesB[indexB]
    ) {
        combinedStackFrames.unshift(stackFramesA[indexA]);
        indexA--;
        indexB--;
    }

    // At this point, either we've exhausted one or both stacks, or we need
    // to add frames from A and then remaining frames from B.
    for (indexA; indexA >= 0; indexA--) {
        combinedStackFrames.unshift(stackFramesA[indexA]);
    }
    for (indexB; indexB >= 0; indexB--) {
        combinedStackFrames.unshift(stackFramesB[indexB]);
    }

    // Now that we've combined the stacks, let's also combine the messages
    // and return our new stack.
    return new NormalizedErrorInfo(
        buildCausedByMessage(consequence.message, cause.message),
        combinedStackFrames,
    );
};
