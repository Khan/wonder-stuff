// @flow
import {Errors} from "@khanacademy/wonder-stuff-core";
import {EmptySentryData} from "./empty-sentry-data";
import {KindSentryError} from "./kind-sentry-error";
import {truncateTagValue} from "./truncate-tag-value";
import {isTagKeyValid} from "./is-tag-key-valid";
import type {SentryTags, SentryData, KindErrorDataOptions} from "./types";
import {isReservedTagKey} from "./is-reserved-tag-key";
import {isReservedContextProperty} from "./is-reserved-context-property";

/**
 * Validate sentry data, normalizing tag values as necessary.
 *
 * This will throw if tag keys are too long, match reserved keys, or contexts
 * contain reserved property names.
 *
 * Tag values that are too long will be truncated, preserving the start
 * and end of the value.
 *
 * @export
 * @throws {KindSentryError} If the sentry data is invalid. This includes
 * sentry data reporting the problems that were found.
 * @param {?$ReadOnly<$Partial<SentryData>>} data
 * @returns {SentryData}
 */
export function normalizeSentryData(
    options: KindErrorDataOptions,
    data: ?$ReadOnly<$Partial<SentryData>>,
): SentryData {
    // https://docs.sentry.io/platforms/python/guides/logging/enriching-events/tags/
    const tags: SentryTags = {
        ...data?.tags,
    };
    const invalidKeys = [];
    const usedReservedKeys = [];
    // We want to valid tag keys and normalize tag values.
    // However, we don't bother with the validation production.
    for (const key of Object.keys(tags)) {
        if (process.env.NODE_ENV !== "production") {
            // Tag keys must be valid (see isValidTagKey for details).
            // Grab all the long keys and report them together; it's easier
            // on devs then to fix all at once.
            if (!isTagKeyValid(key)) {
                invalidKeys.push(key);
            }

            // Some tag keys are reserved and should not be used.
            if (isReservedTagKey(options, key)) {
                usedReservedKeys.push(key);
            }
        }

        // Tag values must be no more than the max length (see truncateTagValue
        // for details).
        // We don't error on these, we just fix them by truncating the middle.
        tags[key] = truncateTagValue(tags[key]);
    }

    // If the contexts contain any reserved property names, report them, but
    // only in production.
    if (process.env.NODE_ENV !== "production") {
        const reservedPropertyContexts: {|
            [string]: Array<string>,
        |} = {};
        const contexts = data?.contexts;
        if (contexts != null) {
            for (const contextName of Object.keys(contexts)) {
                const context = contexts[contextName];
                if (context == null) {
                    continue;
                }
                for (const propertyName of Object.keys(context)) {
                    if (!isReservedContextProperty(propertyName)) {
                        continue;
                    }

                    const record = reservedPropertyContexts[contextName] || [];
                    record.push(propertyName);
                    reservedPropertyContexts[contextName] = record;
                }
            }
        }

        // If we found any error conditions, let's report them.
        if (
            invalidKeys.length > 0 ||
            usedReservedKeys.length > 0 ||
            Object.keys(reservedPropertyContexts).length > 0
        ) {
            throw new KindSentryError(
                "Sentry data is not valid",
                Errors.InvalidInput,
                {
                    sentryData: {
                        contexts: {
                            "Invalid Sentry Data": {
                                invalid_tag_keys: invalidKeys,
                                reserved_tag_keys: usedReservedKeys,
                                contexts_with_reserved_properties:
                                    (reservedPropertyContexts: $FlowFixMe),
                            },
                        },
                    },
                },
            );
        }
    }

    return {
        // We set the defaults here so that we know these will be
        // there, even if they're empty.
        ...EmptySentryData,
        // And we override with what was passed in.
        ...data,
        // And we override with the truncated tag values.
        tags,
    };
}
