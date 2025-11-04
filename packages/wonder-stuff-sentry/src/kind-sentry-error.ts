import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {Metadata} from "@khanacademy/wonder-stuff-core";
import type {SentryData} from "./types";
import {EmptySentryData} from "./empty-sentry-data";

/**
 * Options for constructing a `KindError`.
 */
type Options = {
    /**
     * An error responsible for the error being created.
     *
     * @type {?Error}
     */
    cause?: Error | null | undefined;
    /**
     * Sentry tags, contexts, and fingerprint information to be attached.
     *
     * This data will be added to the Sentry scope when using `captureError`.
     *
     * @type {?$Partial<SentryData>}
     */
    sentryData?: Partial<SentryData> | null | undefined;
    /**
     * Other data to be attached to the error.
     *
     * This data will not be added to Sentry when using `captureError`.
     *
     * @type {?Metadata}
     */
    metadata?: Metadata | null | undefined;
    /**
     * A prefix to be added to the error name.
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
     * @type {?number}
     */
    stripStackFrames?: number | null | undefined;
    /**
     * The minimum number of stack frames to try and retain.
     *
     * @type {?number}
     */
    minimumFrameCount?: number | null | undefined;
    /**
     * Should we create a composite stack from the causal error chain or not?
     *
     * @type {?boolean}
     */
    compositeStack?: boolean | null | undefined;
};

/**
 * An error that can be used to capture details for reporting to Sentry.
 *
 * The error kind will be a tag on the reported Sentry event.
 *
 * @class KindSentryError
 * @extends {KindError}
 */
export class KindSentryError extends KindError {
    /**
     *Creates an instance of KindSentryError.
     * @param {string} message The error message.
     * @param {string} [kind] The kind of error. This will be combined with
     * `prefix` to form the name of the error, i.e. PrefixSentryKindError.
     * Defaults to `Errors.Unknown`.
     * @param {Options} [options] Options for constructing the error.
     * @param {Error} [options.cause] The error that caused this error.
     * @param {Metadata} [options.metadata] The metadata to attach
     * to the error.
     * @param {string} [options.prefix=""] A prefix to prepend the name of the
     * error.
     * @param {string} [options.name="Error"] The name of the error.
     * @param {number} [options.stripStackFrames=0] The number of stack frames
     * to remove from the error's stack. This can be used to ensure that the top
     * call of the stack references the point at which an error is thrown which
     * can be useful when helper functions are used to build the error being
     * thrown.
     * @param {number} [options.minimumFrameCount=1] The minimum number of
     * stack frames to try and retain. This can be used to prevent stripping
     * all stack frames from the error's stack.
     * @param {boolean} [options.compositeStack=false] Should we build a
     * composite stack from the causal error chain or not?
     */
    constructor(
        message: string,
        kind: string = Errors.Unknown,
        // It's perfectly valid for options to be an empty object.
        options: Options = Object.freeze({}),
    ) {
        const {metadata, sentryData, name, ...restOptions} = options;

        super(message, kind, {
            ...restOptions,
            name: name ?? "Sentry",
            // We want to combine sentry data and metadata into a single object
            // to send to our super class since folks using this error likely
            // still want the sentry data to go wherever metadata goes.
            // We have a couple of options to avoid name collisions:
            //   1. Assign the given metadata and sentryData to independent keys.
            //   2. Check that metadata doesn't contain `sentryData` and use that
            //      key, either overwriting what is there, or erroring if this
            //      reserved key is used.
            // Option 1 is cleaner but adds indentation to the data.
            // Option 2 may make more readable data when stringified, but needs
            // a policy on what to do about a key collision.
            // For simplicity of implementation and ease of API use, we choose
            // option 1.
            metadata: {
                sentry: {
                    ...EmptySentryData,
                    ...sentryData,
                },
                other: metadata,
            },
        });
    }

    get sentryData(): Readonly<SentryData> {
        // (1) We always ensure there is metadata
        // (2) We know that the sentry data has the fields we need.
        // (3) We know that the sentry data in the metadata only has the fields
        //     we need.
        // @ts-expect-error [FEI-5011] - TS2322 - Type 'MetadataPrimitive | Metadata | MetadataArray<MetadataPrimitive | Metadata>' is not assignable to type 'Readonly<SentryData>'. | TS2533 - Object is possibly 'null' or 'undefined'.
        return this.metadata.sentry;
    }
}
