// @flow
import typeof {Errors} from "./errors.js";

/**
 * What kind of error is being reported.
 */
export type ErrorKind = $Values<Errors>;

/**
 * A collection of data.
 */
export type Metadata = {
    +[name: string]: Metadata | string | number | boolean | null,
};

/**
 * Normalized error info.
 */
export interface NormalizedErrorInfo {
    /**
     * The normalized error message.
     */
    get message(): string;

    /**
     * The stack as a string array from most recent to oldest.
     */
    get stack(): $ReadOnlyArray<string>;

    /**
     * Generates a string of the message and stack.
     */
    toString(): string;
}
