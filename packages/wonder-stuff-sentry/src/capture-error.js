// @flow
import {collateSentryData} from "./collate-sentry-data.js";
import {getSentry} from "./init.js";

import type {SentryData} from "./types.js";

/**
 * Capture a given error in Sentry.
 *
 * @param {Error} error The error to be captured.
 */
export const captureError = (error: Error): void => {
    const sentryData: SentryData = collateSentryData(error);
    const sentry = getSentry();
    sentry.withScope((scope) => {
        /**
         * OK, let's see what scope things we need to add and add them.
         */
        const {tags, contexts, fingerprint} = sentryData;

        /**
         * Tags help categorize things.
         */
        if (Object.keys(tags).length > 0) {
            scope.setTags(tags);
        }

        /**
         * Each context creates a new headed section in the sentry report.
         * Useful for grouping specific context together.
         *
         * We now output all the contexts to the scope.
         */
        const contextNames = Object.keys(contexts);
        for (const name of contextNames) {
            scope.setContext(name, contexts[name]);
        }

        /**
         * Fingerprint helps group like messages that otherwise would not
         * get grouped.
         */
        if (fingerprint.length > 0) {
            scope.setFingerprint(fingerprint);
        }

        /**
         * We always use captureException because we alway coerce our
         * error logging to be an Error object. :)
         */
        sentry.captureException(error);
    });
};
