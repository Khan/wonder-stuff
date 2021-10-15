// @flow
import type {SentryData} from "./types.js";

/**
 * Reduce the values of one sentry data object into another.
 *
 * For `tags` and `contexts`, existing values are overwritten.
 * For `fingerprints`, the arrays are concatenated together.
 *
 * This method works best with `reduce` or `reduceRight`.
 *
 * @param {SentryData} accumulator The target object being reduced into.
 * @param {?$ReadOnly<SentryData>} current The next SentryData object to be reduced.
 * @param {number} index The index in the array being reduced of the current
 * object being reduced.
 * @param {$ReadOnlyArray<SentryData>} array The array being reduced.
 * @returns {SentryData} The reduced sentry data.
 */
export const sentryDataReducer = (
    accumulator: SentryData,
    current: ?$ReadOnly<SentryData>,
    index: number,
    array: $ReadOnlyArray<?SentryData>,
): SentryData => {
    if (current == null) {
        return accumulator;
    }

    // Get the bits of information from the accumulator and current datasets.
    const {
        tags: accumulatorTags,
        contexts: accumulatorContexts,
        fingerprint: accumulatorFingerprint,
    } = accumulator;
    const {
        tags: currentTags,
        contexts: currentContexts,
        fingerprint: currentFingerprint,
    } = current;

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

    // Rebuild into a combined dataset and return.
    return {
        tags,
        contexts,
        fingerprint,
    };
};
