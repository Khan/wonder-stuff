import {Errors} from "@khanacademy/wonder-stuff-core";
import {Integration, Event, EventHint} from "@sentry/core";
import type {KindErrorDataOptions} from "./types";

import {collateSentryData} from "./collate-sentry-data";
import {DefaultKindErrorDataOptions} from "./default-kind-error-data-options";
import {isTagKeyValid} from "./is-tag-key-valid";
import {KindSentryError} from "./kind-sentry-error";

type InvalidTags = {
    invalidKindTag?: string;
    invalidGroupByTag?: string;
    invalidConcatenatedMessageTag?: string;
};

const INTEGRATION_NAME = "KindErrorData";

function buildOptionsWithDefaults(
    options?: Partial<KindErrorDataOptions>,
): KindErrorDataOptions {
    const _options = {
        ...DefaultKindErrorDataOptions,
        ...options,
    };

    if (process.env.NODE_ENV !== "production") {
        // Let's make sure we got valid options.
        const invalidTagNames: InvalidTags = {};
        if (!isTagKeyValid(_options.kindTagName)) {
            invalidTagNames.invalidKindTag = _options.kindTagName;
        }
        if (!isTagKeyValid(_options.groupByTagName)) {
            invalidTagNames.invalidGroupByTag = _options.groupByTagName;
        }
        if (!isTagKeyValid(_options.concatenatedMessageTagName)) {
            invalidTagNames.invalidConcatenatedMessageTag =
                _options.concatenatedMessageTagName;
        }
        if (Object.keys(invalidTagNames).length) {
            throw new KindSentryError("Invalid options", Errors.InvalidInput, {
                sentryData: {
                    contexts: {
                        invalidTagNames: {
                            ...invalidTagNames,
                        },
                    },
                },
            });
        }
    }

    return _options;
}

/**
 * Attaches extracted information from the Error object to extra field in the Event
 */
function enhanceEventWithErrorData(
    options: KindErrorDataOptions,
    event: Event,
    hint?: EventHint,
): Event {
    const maybeError = hint?.originalException;
    // We only enhance events of type error.
    if (!(maybeError instanceof Error)) {
        return event;
    }

    // Collate the data we want to collect.
    const {tags, contexts, fingerprint} = collateSentryData(
        options,
        maybeError,
    );

    // Now that we have data, we need to attach it to the event.
    /**
     * Tags help categorize things.
     */
    event.tags = {
        ...event.tags,
        ...tags,
    };

    /**
     * Each context creates a new headed section in the sentry report.
     * Useful for grouping specific context together.
     *
     * We now output all the contexts to the scope.
     */
    const updatedContexts = {
        ...event.contexts,
        ...contexts,
    } as const;
    /**
     * NOTE: If you don't see Sentry serializing the right depth in your
     * contexts, increase the `normalizeDepth` option of the Sentry
     * configuration; it defaults to 3, which is not always enough.
     */
    event.contexts = updatedContexts;

    /**
     * Fingerprint helps group like messages that otherwise would not
     * get grouped.
     */
    event.fingerprint = [...(event.fingerprint ?? []), ...fingerprint];

    return event;
}

export function kindErrorDataIntegration(
    options?: Partial<KindErrorDataOptions>,
): Integration {
    const _options = buildOptionsWithDefaults(options);

    return {
        name: INTEGRATION_NAME,
        processEvent(event, hint, client) {
            return enhanceEventWithErrorData(_options, event, hint);
        },
    };
}
