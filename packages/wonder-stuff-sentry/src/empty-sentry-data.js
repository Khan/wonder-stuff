// @flow
import type {SentryData} from "./types";

/**
 * An empty sentry data object.
 */
export const EmptySentryData: $ReadOnly<SentryData> = Object.freeze({
    tags: {},
    contexts: {},
    fingerprint: [],
});
