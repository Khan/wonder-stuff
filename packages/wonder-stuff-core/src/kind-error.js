// @flow
import {Errors} from "./errors.js";
import {ErrorInfo} from "./error-info.js";
import {cloneMetadata} from "./clone-metadata.js";

import type {Metadata} from "./types.js";

/**
 * Options for constructing a `KindError`.
 */
type Options = {|
    /**
     * An error responsible for the error being created.
     *
     * @type {Error}
     */
    cause?: Error,

    /**
     * Data to be attached to the error.
     *
     * @type {$ReadOnly<Metadata>}
     */
    metadata?: $ReadOnly<Metadata>,

    /**
     * A prefix to be added to the error name.
     *
     * @type {string}
     */
    prefix?: string,

    /**
     * The number of stack frames to strip from the error.
     *
     * @type {number}
     */
    stripStackFrames?: number,

    /**
     * The minimum number of stack frames to try and retain.
     *
     * @type {number}
     */
    minimumFrameCount?: number,
|};

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
     * @memberof KindError
     * @param {string} message The error message.
     * @param {string} [kind] The kind of error. This will be combined with
     * `prefix` to form the name of the error, i.e. PrefixKindError.
     * Defaults to `Errors.Unknown`.
     * @param {Options} [options] Options for constructing the error.
     * @param {Error} [options.cause] The error that caused this error.
     * @param {Metadata} [options.metadata] The metadata to attach to the error.
     * @param {string} [options.prefix=""] A prefix to prepend the name of the
     * error.
     * @param {number} [options.stripStackFrames=0] The number of stack frames to
     * remove from the error's stack. This can be used to ensure that the top
     * call of the stack references the point at which an error is thrown which
     * can be useful when helper functions are used to build the error being
     * thrown.
     * @param {number} [options.minimumFrameCount=1] The minimum number of
     * stack frames to try and retain. This can be used to prevent stripping
     * all stack frames from the error's stack.
     */
    constructor(
        message: string,
        kind: string = Errors.Unknown,
        {
            cause,
            prefix,
            metadata,
            stripStackFrames,
            minimumFrameCount,
        }: Options = {
            cause: undefined,
            metadata: undefined,
            prefix: "",
            stripStackFrames: 0,
            minimumFrameCount: 1,
        },
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
        if (stripStackFrames && stripStackFrames < 0) {
            throw new Error("stripStackFrames must be >= 0");
        }
        if (minimumFrameCount && minimumFrameCount < 0) {
            throw new Error("minimumFrameCount must be >= 0");
        }

        super(message);

        // Save the original message as we may change this message later.
        this.originalMessage = message;

        // Metadata associated with this error.
        this.metadata = cloneMetadata(metadata);

        // Set the name so we get a nice error output, like
        // KAInternalError
        this.name = `${prefix ?? ""}${kind}Error`;

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
            const combined = ErrorInfo.fromConsequenceAndCause(
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
