import {Errors} from "./errors";
import {ErrorInfo} from "./error-info";
import {cloneMetadata} from "./clone-metadata";

import type {Metadata} from "./types";

/**
 * Options for constructing a `KindError`.
 */
export type Options = {
    /**
     * An error responsible for the error being created.
     *
     * @type {?Error}
     */
    cause?: Error | null | undefined;
    /**
     * Data to be attached to the error.
     *
     * @type {?Metadata}
     */
    metadata?: Metadata | null | undefined;
    /**
     * A prefix for the error name.
     *
     * @type {?string}
     */
    prefix?: string | null | undefined;
    /**
     * A name for the error.
     *
     * @type {?string}
     */
    name?: string | null | undefined;
    /**
     * The number of stack frames to strip from the error.
     *
     * This is added as a property on the error as a hint to frameworks like
     * Sentry on how to process the stack.
     *
     * @type {?number}
     */
    framesToPop?: number | null | undefined;
};

/**
 * An error to describe detailed states and relationships.
 *
 * This error type supports error taxonomies and attachment of metadata, as
 * well as causal relationships between itself and another source error.
 * More specific variations can be built off this to provide a payload for
 * logging setups like Sentry or winston.
 */
export class KindError extends Error {
    readonly kind: string;
    /**
     * The number of stack frames to pop from the top of the stack.
     *
     * This is used by Sentry to determine how to process the stack for us.
     */
    readonly framesToPop: number;
    readonly originalMessage: string;
    readonly metadata: Readonly<Metadata> | null | undefined;
    readonly cause: Error | null | undefined;

    /**
     * Creates an instance of `KindError`.
     *
     * @param {string} message The error message.
     * @param {string} [kind] The kind of error. This will be combined with
     * `prefix` to form the name of the error, i.e. PrefixKindError.
     * Defaults to `Errors.Unknown`.
     * @param {Options} [options] Options for constructing the error.
     * @param {Error} [options.cause] The error that caused this error.
     * @param {$ReadOnly<Metadata>} [options.metadata] The metadata to attach
     * to the error.
     * @param {string} [options.prefix=""] A prefix to prepend the name of the
     * error.
     * @param {string} [options.name="Error"] The name of the error.
     * @param {number} [options.stripStackFrames=0] The number of stack frames
     * to remove from the error's stack. This can be used to ensure that the top
     * call of the stack references the point at which an error is thrown which
     * can be useful when helper functions are used to build the error being
     * thrown.
     */
    constructor(
        message: string,
        kind: string = Errors.Unknown,
        {cause, prefix, name, metadata, framesToPop}: Options = Object.freeze(
            {},
        ),
    ) {
        if (process.env.NODE_ENV !== "production") {
            // Validate arguments.
            if (cause && !(cause instanceof Error)) {
                throw new Error("cause must be an instance of Error");
            }
            if (name != null && /\s/g.test(name)) {
                throw new Error("name must not contain whitespace");
            }
            if (/\s/g.test(kind)) {
                throw new Error("kind must not contain whitespace");
            }
            if (prefix != null && /\s/g.test(prefix)) {
                throw new Error("prefix must not contain whitespace");
            }
            if (framesToPop != null && framesToPop < 0) {
                throw new Error("framesToPop must be >= 0");
            }
        }

        super(message);

        // Save the original message as we may change this message later.
        this.originalMessage = message;

        // Metadata associated with this error.
        this.metadata = cloneMetadata(metadata);

        // Set the name so we get a nice error output, like
        // KAInternalError
        this.name = `${prefix ?? ""}${kind}${name ?? ""}Error`;

        // The kind of error which can be used for grouping with
        // other error sources that use the same error taxonomy.
        this.kind = kind;

        // The cause of this error, if there is one.
        this.cause = cause;

        // How many frames should we pop from the top of the stack?
        // This is used by things like Sentry when processing the error to
        // provide better stack traces.
        this.framesToPop = framesToPop ?? 0;

        if (cause != null) {
            // We want to normalize our error message and stack, stripping off
            // frames that may obfuscate the real error cause.
            const normalizedError = ErrorInfo.normalize(this);

            // We want a better error message that reflects the causal error
            // chain, and we might also want a composite stack built from
            // those errors instead of the stack we have.

            // We don't normalize the cause as this should have happened already
            // when it was, itself, created with a cause.
            const causeInfo = ErrorInfo.from(cause);
            const combined = ErrorInfo.fromConsequenceAndCause(
                normalizedError,
                causeInfo,
            );

            // We update our message to a standardized one, giving us a nice
            // causal relationship in the message.
            this.message = combined.message;
        }
    }
}
