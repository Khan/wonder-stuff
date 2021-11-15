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
export type SentryContext = Metadata;

/**
 * Named contexts for a Sentry event.
 *
 * The key of each item is the name of the context.
 */
export type SentryContexts = {
    [name: string]: SentryContext,
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
export type SentryData = {|
    /**
     * This is passed to setTags on the sentry scope.
     * Tags help categorize things.
     */
    tags: SentryTags,

    /**
     * These are each passed to setContext on the sentry scope.
     * Contexts create a new headed section in the sentry report.
     * Useful for grouping specific context together.
     */
    contexts: SentryContexts,

    /**
     * This is passed to setFingerprint on the sentry scope.
     * The fingerprint helps group like messages that otherwise would not
     * get grouped.
     */
    fingerprint: SentryFingerprint,
|};

export type KindErrorDataOptions = {
    /**
     * The name to use for the Sentry tag that indicates the error kind.
     */
    +kindTagName: string,

    /**
     * The name to use for the Sentry tag that indicates the grouping string.
     */
    +groupByTagName: string,

    /**
     * The name to use for the Sentry tag that contains the concatenated error.
     */
    +concatenatedMessageTagName: string,

    /**
     * The prefix to use for Sentry contexts that contain information about
     * each error in the causal error chain.
     * A unique number is appended to the prefix to create the context name.
     */
    +causalErrorContextPrefix: string,

    // TODO(somewhatabstract): Allow configuration of which fields we include
    // in causal error contexts.

    /**
     * Whether to stringify nested context data or not.
     *
     * If true, any arrays or objects that are more than one level deep in the
     * context data hierarchy will be stringified so that they are easily
     * readable in Sentry (it seems that Sentry doesn't expand nested data,
     * possibly down to the plan being used).
     */
    +stringifyNestedContext: boolean,
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

export interface SentryEvent {
    event_id?: string;
    message?: string;
    timestamp?: number;
    start_timestamp?: number;
    level?: SentrySeverity;
    platform?: string;
    logger?: string;
    server_name?: string;
    release?: string;
    dist?: string;
    environment?: string;
    sdk?: $FlowFixMe;
    request?: Request;
    transaction?: string;
    modules?: {[key: string]: string};
    fingerprint?: SentryFingerprint;
    exception?: {
        values?: Array<$FlowFixMe>,
    };
    stacktrace?: $FlowFixMe;
    breadcrumbs?: Array<$FlowFixMe>;
    contexts?: SentryContexts;
    tags?: SentryTags;
    extra?: SentryContext;
    user?: $FlowFixMe;
    type?: $FlowFixMe;
    spans?: Array<$FlowFixMe>;
    measurements?: $FlowFixMe;
    debug_meta?: $FlowFixMe;
}

export interface SentryEventHint {
    event_id?: string;
    captureContext?: $FlowFixMe;
    syntheticException?: ?Error;
    originalException?: ?(Error | string);
    data?: $FlowFixMe;
}

export type SentryEventProcessor = (
    event: SentryEvent,
    hint?: SentryEventHint,
) => Promise<?SentryEvent> | ?SentryEvent;

export interface SentryHub {
    getIntegration<T: SentryIntegration>(integration: Class<T>): ?T;
}

export interface SentryIntegration {
    name: string;

    /**
     * Sets the integration up only once.
     * This takes no options on purpose, options should be passed in the constructor
     */
    setupOnce(
        addGlobalEventProcessor: (callback: SentryEventProcessor) => void,
        getCurrentHub: () => SentryHub,
    ): void;
}
// <- Sentry-specific types above this point.
/////////////////////////////////////////////
