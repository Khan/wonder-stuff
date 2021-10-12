// @flow
import {Errors} from "./errors.js";
import {ErrorInfo} from "./error-info.js";
import {cloneMetadata} from "./clone-metadata.js";

import type {Metadata} from "./types.js";

/**
 * An error to describe detailed states and relationships.
 *
 * This error type supports error taxonomies and attachment of metadata, as
 * well as causal relationships between itself and another source error.
 * More specific variations can be built off this to provide a payload for
 * logging setups like Sentry or winston.
 */
export class KindError extends Error {
    +kind: string;
    +originalMessage: string;
    +metadata: ?$ReadOnly<Metadata>;

    /**
     * Creates an instance of `KindError`.
     *
     * @param {string} message The error message.
     * @param {TKinds} [kind] The kind of error. This will be combined with
     * `prefix` to form the name of the error, i.e. PrefixKindError.
     * Defaults to `Errors.Unknown`.
     * @param {Error} [cause] The error that caused this error.
     * @param {Metadata} [metadata] The metadata to attach to the error.
     * @param {string} [prefix] A prefix to prepend the name of the error.
     * Defaults to `""`.
     * @param {number} [stripStackFrames] The number of stack frames to remove
     * from the error's stack. This can be used to ensure that the top call of
     * the stack references the point at which an error is thrown which can
     * be useful when helper functions are used to build the error being thrown.
     * Defaults to `0`.
     * @memberof KindError
     */
    constructor(
        message: string,
        kind: string = Errors.Unknown,
        cause: ?Error = null,
        metadata: ?$ReadOnly<Metadata> = null,
        prefix: string = "",
        stripStackFrames: number = 0,
        minimumFrameCount: number = 1,
    ) {
        // Validate arguments.
        if (cause && !(cause instanceof Error)) {
            throw new Error("cause must be an instance of Error");
        }
        if (kind && /\s/g.test(kind)) {
            throw new Error("kind must not contain whitespace");
        }
        if (prefix && /\s/g.test(prefix)) {
            throw new Error("prefix must not contain whitespace");
        }
        if (stripStackFrames < 0) {
            throw new Error("stripStackFrames must be >= 0");
        }
        if (minimumFrameCount < 0) {
            throw new Error("minimumFrameCount must be >= 0");
        }

        super(message);

        // Save the original message as we may change this message later.
        this.originalMessage = message;

        // Metadata associated with this error.
        this.metadata = cloneMetadata(metadata);

        // Set the name so we get a nice error output, like
        // KAInternalError
        this.name = `${prefix}${kind}Error`;

        // The kind of error which can be used for grouping with
        // other error sources that use the same error taxonomy.
        this.kind = kind;

        if (cause != null) {
            // We want to generate a better stack trace using the source error
            // and our own stack.
            const normalizedError = ErrorInfo.normalize(
                this,
                stripStackFrames,
                minimumFrameCount,
            );
            const normalizedCause = ErrorInfo.normalize(cause);
            const combined = ErrorInfo.combine(
                normalizedError,
                normalizedCause,
            );

            /**
             * $FlowIgnore[incompatible-type]
             * Flow doesn't like us leaving KAError temporarily without a
             * stack, but I don't want this crashing because we try to
             * assign to a readonly thing, so being mildly cautious.
             */
            delete this.stack;
            this.stack = combined.toString();

            // We update our message to a normalized one from the combined
            // stacks, as this gives us a nice causal relationship.
            this.message = combined.message;
        }
    }
}
