import {buildCausedByMessage} from "./build-caused-by-message";

/**
 * Information about an error.
 *
 * This is used to simplify and standardize extracting and combining error
 * information.
 */
export class ErrorInfo {
    readonly _name: string;
    readonly _message: string;

    constructor(name: string, message: string) {
        this._name = name;
        this._message = message;
    }

    /**
     * The error message.
     */
    get message(): string {
        return this._message;
    }

    /**
     * The error name.
     */
    get name(): string {
        return this._name;
    }

    /**
     * The error message prefixed with the error name.
     */
    get messageWithName(): string {
        return `${this.name}: ${this.message}`;
    }

    /**
     * Combine the info of an error and the error that caused it.
     */
    static fromConsequenceAndCause(
        consequence: ErrorInfo,
        cause: ErrorInfo,
    ): ErrorInfo {
        if (process.env.NODE_ENV !== "production") {
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
        }

        // Now that we've combined the stacks, let's also combine the messages
        // and return our new stack.
        return new ErrorInfo(
            consequence.name,
            buildCausedByMessage(consequence.message, cause.messageWithName),
        );
    }

    /**
     * Get normalized error information from an error.
     *
     * @param {Error} error The error to be normalized.
     * @returns {ErrorInfo} Normalized error information for the given
     * error.
     */
    static normalize(error: Error): ErrorInfo {
        if (process.env.NODE_ENV !== "production") {
            // Verify our arguments.
            if (!(error instanceof Error)) {
                throw new Error("Error must be an instance of Error");
            }
        }

        const errorMessage = error.message;

        // The normalized message is just the first line of the error message.
        const normalizedMessage =
            errorMessage
                .toString()
                .split("\n")
                .find((l) => l.trim().length) ?? "(empty message)";

        return new ErrorInfo(error.name, normalizedMessage);
    }

    /**
     * Get error information from an error.
     *
     * @param {Error} error The error from which to grab the info.
     * @returns {ErrorInfo} Error information for the given error.
     */
    static from(error: Error): ErrorInfo {
        if (process.env.NODE_ENV !== "production") {
            // Verify our arguments.
            if (!(error instanceof Error)) {
                throw new Error("Error must be an instance of Error");
            }
        }

        return new ErrorInfo(error.name, error.message);
    }
}
