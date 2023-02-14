import type {SentryData} from "./types";

/**
 * An empty sentry data object.
 */
export const EmptySentryData: Readonly<SentryData> = Object.freeze({
    tags: {},
    contexts: {},
    fingerprint: [],
});
