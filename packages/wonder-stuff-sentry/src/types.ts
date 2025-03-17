import type {Metadata} from "@khanacademy/wonder-stuff-core";

/**
 * Tags for a Sentry event.
 *
 * The key of each item is the name of the tag.
 */
export type SentryTags = {
    [name: string]: string;
};

/**
 * A context object for a Sentry event.
 *
 * The key of each item is the name of a field within the context.
 */
export type SentryContext = Metadata;

/**
 * Named contexts for a Sentry event.
 *
 * The key of each item is the name of the context.
 */
export type SentryContexts = {
    [name: string]: SentryContext;
};

/**
 * A Sentry fingerprint.
 *
 * This is an array of strings.
 */
export type SentryFingerprint = Array<string>;

/**
 * Data to be sent to sentry.
 *
 * @typedef {Object} SentryData
 * @property {SentryTags} tags The tags to add for the associated sentry event.
 * This is equivalent to using the `setTag` and `setTags` APIs.
 * @property {SentryContexts} contexts The contexts to add for the associated
 * sentry event.
 * This is equivalent to using the `setContext` API.
 * NOTE: `setExtras` is deprecated. For similar behavior, use a context keyed as
 * `"Additional Data"`.
 * @property {Array<string>} fingerprint The fingerprint of the
 * associated sentry event.
 * This is equivalent to using the `setFingerprint` API.
 */
export type SentryData = {
    /**
     * This is passed to setTags on the sentry scope.
     * Tags help categorize things.
     */
    tags: SentryTags;
    /**
     * These are each passed to setContext on the sentry scope.
     * Contexts create a new headed section in the sentry report.
     * Useful for grouping specific context together.
     */
    contexts: SentryContexts;
    /**
     * This is passed to setFingerprint on the sentry scope.
     * The fingerprint helps group like messages that otherwise would not
     * get grouped.
     */
    fingerprint: SentryFingerprint;
};

export type KindErrorDataOptions = {
    /**
     * The name to use for the Sentry tag that indicates the error kind.
     */
    readonly kindTagName: string;
    /**
     * The name to use for the Sentry tag that indicates the grouping string.
     */
    readonly groupByTagName: string;
    /**
     * The name to use for the Sentry tag that contains the concatenated error.
     */
    readonly concatenatedMessageTagName: string;
    /**
     * The prefix to use for Sentry contexts that contain information about
     * each error in the causal error chain.
     * A unique number is appended to the prefix to create the context name.
     */
    readonly causalErrorContextPrefix: string;

    // TODO(somewhatabstract): Allow configuration of which fields we include
    // in causal error contexts.
};
