// @flow
import {
    safeStringify,
    getOriginalStackFromError,
} from "@khanacademy/wonder-stuff-core";
import {getSentryDataFromError} from "./get-sentry-data-from-error";
import type {SentryData, KindErrorDataOptions} from "./types";
import {EmptySentryData} from "./empty-sentry-data";

/**
 * Reduces an Error down into sentry data.
 *
 * For `tags` and `contexts`, existing values in the accumulator are overwritten.
 * For `fingerprints`, the arrays are concatenated together.
 *
 * Each error that is not index-0 is also added as a named context.
 *
 * This method works best with `reduce` or `reduceRight`.
 *
 * @param {$ReadOnly<SentryData>} accumulator The accumulated `SentryData` so
 * far.
 * @param {Error} current The next Error to be reduced.
 * @param {number} index The index in the reducing array of the current
 * Error being reduced.
 * @returns {SentryData} The reduced sentry data.
 */
export const sentryDataReducer = (
    options: KindErrorDataOptions,
    accumulator: $ReadOnly<SentryData>,
    current: Error,
    index: number,
): SentryData => {
    const {causalErrorContextPrefix} = options;

    // Get the bits of information from the accumulator and current error.
    const {
        tags: accumulatorTags,
        contexts: accumulatorContexts,
        fingerprint: accumulatorFingerprint,
    } = accumulator;
    const currentSentryData = getSentryDataFromError(current);
    const {
        tags: currentTags,
        contexts: currentContexts,
        fingerprint: currentFingerprint,
    } = currentSentryData ?? EmptySentryData;

    // TODO(somewhatabstract): Should we verify we aren't using any reserved
    // contexts, tags?

    // Combine tags by spreading the current tags over the accumulator tags.
    const tags = {...accumulatorTags, ...currentTags};

    // Combine contexts by spreading the current contexts over the accumulator
    // contexts.
    const contexts = {...accumulatorContexts, ...currentContexts};

    // Combine fingerprint information, making sure to deduplicate via a Set and
    // remove any empty strings with a Boolean filter.
    const fingerprint = Array.from(
        new Set(
            [...accumulatorFingerprint, ...currentFingerprint].filter(Boolean),
        ),
    );

    // Next, unless the index is 0, we need to add a context for the error.
    if (index !== 0) {
        contexts[
            `${causalErrorContextPrefix}${index}` // e.g., "Source Error - 1"
        ] = {
            error: current.toString(),
            sentryData: safeStringify(currentSentryData),
            originalStack: getOriginalStackFromError(current),
        };
    }

    // Rebuild into a combined dataset and return.
    return {
        tags,
        contexts,
        fingerprint,
    };
};
