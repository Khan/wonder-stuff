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
     * Data to be attached to the error that would be reported to Sentry.
     *
     * @type {?$ReadOnly<$Partial<SentryData>>}
     */
    sentryData?: ?$ReadOnly<$Partial<SentryData>>,

    /**
     * Data to be attached to the error that will not get reported to Sentry.
     *
     * @type {?$ReadOnly<Metadata>}
     */
    metadata?: ?$ReadOnly<Metadata>,

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
