// @flow
import {buildCausedByMessage} from "./build-caused-by-message.js";

/**
 * Normalized error message and stack.
 */
export class ErrorInfo {
    +_message: string;
    +_stackFrames: $ReadOnlyArray<string>;

    constructor(message: string, stackFrames: $ReadOnlyArray<string>) {
        this._message = message;
        // Copy the stack array just to be sure our internal state won't
        // mutate outside our control.
        this._stackFrames = [...stackFrames];
    }

    /**
     * The normalized error message associated with this stack trace.
     */
    get message(): string {
        return this._message;
    }

    /**
     * An array representing the stack frames of the error.
     *
     * Index 0 being the top of the stack.
     */
    get stack(): $ReadOnlyArray<string> {
        // Copy the stack array just to be sure our internal state won't
        // mutate outside our control.
        return [...this._stackFrames];
    }

    /**
     * Get the stack trace as a string.
     */
    toString(): string {
        // Now construct the string value.
        return `${this._message}\n${this._stackFrames.join("\n")}`;
    }

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
    static combine(consequence: ErrorInfo, cause: ErrorInfo): ErrorInfo {
        // Verify our arguments.
        if (!(consequence instanceof ErrorInfo)) {
            throw new Error("consequence must be an instance of ErrorInfo");
        }
        if (!(cause instanceof ErrorInfo)) {
            throw new Error("cause must be an instance of ErrorInfo");
        }
        if (cause === consequence) {
            throw new Error("cause and consequence must be different");
        }

        // Now, let's combine the stacks. First, we dedupe the frames they
        // share.
        const combinedStackFrames = [];
        const stackFramesA = cause.stack;
        const stackFramesB = consequence.stack;

        // Shared stack frames will be at the bottom of each stack of frames.
        let indexA = stackFramesA.length - 1;
        let indexB = stackFramesB.length - 1;

        // Now iterate both stacks, tracking the frames that exist in both.
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
        return new ErrorInfo(
            buildCausedByMessage(consequence.message, cause.message),
            combinedStackFrames,
        );
    }

    /**
     * Get normalized error information from an error.
     *
     * @param {Error} error The error to be normalized.
     * @param {number} [stripFrames] The number of stack frames to drop from
     * the top of the stack. Defaults to `0`.
     * @param {number} [minimumFrameCount] The number of stack frames to keep
     * as a minimum. This overrides the `stripFrames` value and defaults to `1`.
     * @returns {ErrorInfo} Normalized error information for the given
     * error.
     */
    static normalize(
        error: Error,
        stripFrames: number = 0,
        minimumFrameCount: number = 1,
    ): ErrorInfo {
        // Verify our arguments.
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
            stackFrames.length >= stripFrames + minimumFrameCount
                ? stripFrames
                : 0;

        return new ErrorInfo(
            normalizedMessage,
            stackFrames.slice(actualStripFrames),
        );
    }
}
