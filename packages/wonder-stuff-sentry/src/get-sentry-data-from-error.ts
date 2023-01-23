import {KindSentryError} from "./kind-sentry-error";
import type {SentryData} from "./types";

/**
 * Get the sentry data for a given error, if it has any.
 *
 * @param {Error} error The error from which sentry data is to be extracted.
 * @returns {SentryData} The error's sentry data, or `null` if the error is not
 * a `KindSentryError` instance.
 */
export const getSentryDataFromError = (error: Error): Readonly<SentryData> | null | undefined => {
    if (error instanceof KindSentryError) {
        return error.sentryData;
    }
    return null;
};
