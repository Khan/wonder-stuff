// @flow
import type {NormalizedErrorInfo as INormalizedErrorInfo} from "./types.js";

/**
 * Normalized error message and stack.
 */
export class NormalizedErrorInfo implements INormalizedErrorInfo {
    +_normalizedErrorMessage: string;
    +_stackFrames: $ReadOnlyArray<string>;

    constructor(
        normalizedErrorMessage: string,
        stackFrames: $ReadOnlyArray<string>,
    ) {
        this._normalizedErrorMessage = normalizedErrorMessage;
        this._stackFrames = stackFrames;
    }

    /**
     * The normalized error message associated with this stack trace.
     */
    get message(): string {
        return this._normalizedErrorMessage;
    }

    get stack(): $ReadOnlyArray<string> {
        return this._stackFrames;
    }

    /**
     * Get the stack trace as a string.
     */
    toString(): string {
        // Now construct the string value.
        return `${this._normalizedErrorMessage}\n${this._stackFrames.join(
            "\n",
        )}`;
    }
}
