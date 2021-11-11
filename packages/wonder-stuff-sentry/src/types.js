// @flow
import type {Metadata} from "@khanacademy/wonder-stuff-core";

/**
 * Tags for a Sentry event.
 *
 * The key of each item is the name of the tag.
 */
export type SentryTags = {
    [name: string]: string,
};

/**
 * A context object for a Sentry event.
 *
 * The key of each item is the name of a field within the context.
 */
export type SentryContext = $ReadOnly<Metadata>;

/**
 * Named contexts for a Sentry event.
 *
 * The key of each item is the name of the context.
 */
export type SentryContexts = {
    [name: string]: $ReadOnly<SentryContext>,
};

/**
 * Data to be sent to sentry.
 *
 * @typedef {Object} SentryData
 * @property {?$ReadOnly<SentryTags>} tags The tags to add for the associated sentry event.
 * This is equivalent to using the `setTag` and `setTags` APIs.
 * @property {?$ReadOnly<SentryContexts>} contexts The contexts to add for the associated
 * sentry event.
 * This is equivalent to using the `setContext` API.
 * NOTE: `setExtras` is deprecated. For similar behavior, use a context keyed as
 * `"Additional Data"`.
 * @property {?$ReadOnlyArray<string>} fingerprint The fingerprint of the
 * associated sentry event.
 * This is equivalent to using the `setFingerprint` API.
 */
export type SentryData = {|
    /**
     * This is passed to setTags on the sentry scope.
     * Tags help categorize things.
     */
    +tags: $ReadOnly<SentryTags>,

    /**
     * These are each passed to setContext on the sentry scope.
     * Contexts create a new headed section in the sentry report.
     * Useful for grouping specific context together.
     */
    +contexts: $ReadOnly<SentryContexts>,

    /**
     * This is passed to setFingerprint on the sentry scope.
     * The fingerprint helps group like messages that otherwise would not
     * get grouped.
     */
    +fingerprint: $ReadOnlyArray<string>,
|};

export type InitOptions = {
    kindTagName: string,
    groupByTagName: string,
    concatenatedMessageTagName: string,
    causalErrorContextPrefix: string,
};

/////////////////////////////////////////////
// -> Sentry-specific types below this point.
// NOTE(somewhatabstract): This is not comprehensive typing. Just the things
// we need to use.
type SentrySeverity =
    | "fatal"
    | "error"
    | "warning"
    | "log"
    | "info"
    | "debug"
    | "critical";

interface SentryScope {
    setTags(tags: $ReadOnly<{|[key: string]: string|}>): SentryScope;
    setFingerprint(fingerprint: $ReadOnlyArray<string>): SentryScope;
    setContext(
        name: string,
        context: $ReadOnly<{|[key: string]: mixed|}>,
    ): SentryScope;
}

/**
 * The parts of the unified sentry API that we use.
 *
 * This is the interface that Sentry implementations must expose for us to call.
 */
export interface UnifiedSentryAPI {
    withScope(callback: (scope: SentryScope) => void): void;
    captureException(message: Error, severity?: SentrySeverity): void;
}
// <- Sentry-specific types above this point.
/////////////////////////////////////////////
