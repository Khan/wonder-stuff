// @flow
import {
    errorsFromError,
    Order,
    getKindFromError,
} from "@khanacademy/wonder-stuff-core";
import {EmptySentryData} from "./empty-sentry-data.js";
import {sentryDataReducer} from "./sentry-data-reducer.js";
import {KindSentryError} from "./kind-sentry-error.js";
import {normalizeSentryData} from "./normalize-sentry-data.js";
import {truncateTagValue} from "./truncate-tag-value.js";
import type {SentryData, KindErrorDataOptions} from "./types.js";

/**
 * Collate sentry data from a given error and its causal errors into one object.
 *
 * Parses the error and all causal errors, merging any SentryData found to
 * produce a single SentryData object.
 *
 * For `tags` and `contexts`, existing values of inner (earlier) errors are
 * overwritten by outer (later) errors. For `fingerprints`, the arrays are
 * concatenated together.
 *
 * Each causal error is added as a context containing its original stack,
 * sentry data, and message.
 *
 * Finally, tags for the error kind, grouping, and message concatenation are
 * added.
 *
 * @param {Error} error The error to be collated into sentry data.
 * @returns {$ReadOnly<SentryData>} A single SentryData object combining
 * all the SentryData from this and causal errors it contains.
 */
export const collateSentryData = (
    options: KindErrorDataOptions,
    error: Error,
): $ReadOnly<SentryData> => {
    // First, get all the errors in the stack.
    const errors = errorsFromError(error, Order.ConsequenceFirst);
    const consquenceAndCauses: $ReadOnlyArray<Error> = Array.from(errors);

    // Now, we need to collate this stack as follows:
    // 1. Any sentryData they hold has to be merged into the collatedData from
    //    the cause to the consquence, so that the more recent consequences
    //    take precedent.
    // 2. Errors, regardless of whether they have sentryData, need to be
    //    given their own context in the data.
    const rawCollatedData: $ReadOnly<SentryData> =
        consquenceAndCauses.reduceRight(
            (acc, value, index) =>
                sentryDataReducer(options, acc, value, index),
            EmptySentryData,
        );

    // Before we add our additional tags, we need to ensure that the data is
    // valid and normalized.
    const collatedData = normalizeSentryData(options, rawCollatedData);

    // Finally, add the tags for kind, consequence, and group by.
    const {groupByTagName, concatenatedMessageTagName, kindTagName} = options;
    const kindTag = getKindFromError(error);

    /**
     * We always set the `kind` tag.
     * We set the tag `concatenated_message` to the concatenation of all
     * the wrapped errors' messages, to allow for wildcard searching on a
     * single Sentry Tag (once available in our plan):
     *     e.g., `concatenated_message:'*partial text of inner error*'`
     *
     * We set the tag `group_by_message`, as we have a toggleable
     * server-side rule that changes our grouping to use this value.
     *     `tags.group_by_message:"*" -> {{ tags.group_by_message }}`
     */
    const groupByTag = error.message.trim().split("\n")[0].trim();
    const concatenatedMessageTag =
        error instanceof KindSentryError
            ? error.message.replace(/[\n]+[\t]*/g, " ")
            : error.message.split("\n")[0].trim();

    const tags = {
        ...collatedData.tags,
        [kindTagName]: truncateTagValue(kindTag),
        [concatenatedMessageTagName]: truncateTagValue(concatenatedMessageTag),
    };
    if (groupByTag.length) {
        tags[groupByTagName] = truncateTagValue(groupByTag);
    }

    return {
        tags,
        contexts: collatedData.contexts,
        fingerprint: collatedData.fingerprint,
    };
};
