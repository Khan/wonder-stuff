// @flow
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {Metadata} from "@khanacademy/wonder-stuff-core";
import {EmptySentryData} from "./empty-sentry-data.js";
import type {SentryData} from "./types.js";

/**
 * Options for constructing a `KindError`.
 */
type Options = {
    /**
     * An error responsible for the error being created.
     *
     * @type {?Error}
     */
    cause?: ?Error,

    /**
     * Sentry tags, contexts, and fingerprint information to be attached.
     *
     * This data will be added to the Sentry scope when using `captureError`.
     *
     * @type {?$Partial<SentryData>}
     */
    sentryData?: ?$Partial<SentryData>,

    /**
     * Other data to be attached to the error.
     *
     * This data will not be added to Sentry when using `captureError`.
     *
     * @type {?Metadata}
     */
    metadata?: ?Metadata,

    /**
     * A prefix to be added to the error name.
     *
     * @type {?string}
     */
    prefix?: ?string,

    /**
     * A name for the error.
     *
     * @type {?string}
     */
    name?: ?string,

    /**
     * The number of stack frames to strip from the error.
     *
     * @type {?number}
     */
    stripStackFrames?: ?number,

    /**
     * The minimum number of stack frames to try and retain.
     *
     * @type {?number}
     */
    minimumFrameCount?: ?number,

    /**
     * Should we create a composite stack from the causal error chain or not?
     *
     * @type {?boolean}
     */
    compositeStack?: ?boolean,
};

/**
 * An error that can be used to capture details for reporting to Sentry.
 *
 * The error kind will be a tag on the reported Sentry event.
 *
 * @export
 * @class KindSentryError
 * @extends {KindError}
 */
export class KindSentryError extends KindError {
    /**
     *Creates an instance of KindSentryError.

     * @memberof KindSentryError
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
        options: Options = ({}: $Shape<Options>),
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
                // Flow is unhappy because:
                // 1. metadata is of type Metadata, which can have a variety of
                //    value types, such as string and number.
                // 2. metadata is mutable and as such, something that is type
                //    string could be given a value of type number at some
                //    later point.
                // 3. sentryData (and EmptySentryData) are of type SentryData,
                //    and some of their types are stricter about what types
                //    they can have, such as only string.
                // 4. once sentryData things are part of metadata, sentryData
                //    things could be mutated to the wrong type.
                // 5. Flow doesn't know that we will clone and freeze the
                //    metadata once we pass it into this super constructor here.
                //
                // We could mitigate by making metadata readonly for the base
                // class, but that just pushes the problem on.
                // And we could create a whole new object explicitly copying
                // each bit of data into a new one of the correct type, but
                // since we are about to clone and freeze the data in the base
                // class, that seems like overkill, so let's just suppress
                // flow.
                // $FlowIgnore[incompatible-call]
                sentry: {
                    // We set the defaults here so that we know these will be
                    // there, even if they're empty.
                    ...EmptySentryData,
                    // And we override with what was passed in.
                    ...sentryData,
                },
                other: metadata,
            },
        });
    }

    get sentryData(): $ReadOnly<SentryData> {
        // (1) We always ensure there is metadata
        // (2) We know that the sentry data has the fields we need.
        // (3) We know that the sentry data in the metadata only has the fields
        //     we need.
        // $FlowIgnore[incompatible-use] (1)
        // $FlowIgnore[incompatible-return] (2)
        // $FlowIgnore[incompatible-indexer] (3)
        return this.metadata.sentry;
    }
}
