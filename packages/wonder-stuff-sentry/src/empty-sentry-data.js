// @flow
import type {SentryData} from "./types.js";

/**
 * An empty sentry data object.
 */
export const EmptySentryData: $ReadOnly<SentryData> = Object.freeze({
    tags: {},
    contexts: {},
    fingerprint: [],
});
