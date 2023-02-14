import {Errors} from "@khanacademy/wonder-stuff-core";
import type {
    SentryEvent,
    SentryEventHint,
    SentryEventProcessor,
    SentryHub,
    SentryIntegration,
    KindErrorDataOptions,
} from "./types";

import {collateSentryData} from "./collate-sentry-data";
import {DefaultKindErrorDataOptions} from "./default-kind-error-data-options";
import {isTagKeyValid} from "./is-tag-key-valid";
import {KindSentryError} from "./kind-sentry-error";

type InvalidTags = {
    invalidKindTag?: string;
    invalidGroupByTag?: string;
    invalidConcatenatedMessageTag?: string;
};

export class KindErrorData implements SentryIntegration {
    static id: string = "KindErrorData";
    name: string = KindErrorData.id;
    readonly _options: KindErrorDataOptions;

    constructor(options: Partial<KindErrorDataOptions> = Object.freeze({})) {
        this._options = {
            ...DefaultKindErrorDataOptions,
            ...options,
        };

        if (process.env.NODE_ENV !== "production") {
            // Let's make sure we got valid options.
            const invalidTagNames: InvalidTags = {};
            if (!isTagKeyValid(this._options.kindTagName)) {
                invalidTagNames.invalidKindTag = this._options.kindTagName;
            }
            if (!isTagKeyValid(this._options.groupByTagName)) {
                invalidTagNames.invalidGroupByTag =
                    this._options.groupByTagName;
            }
            if (!isTagKeyValid(this._options.concatenatedMessageTagName)) {
                invalidTagNames.invalidConcatenatedMessageTag =
                    this._options.concatenatedMessageTagName;
            }
            if (Object.keys(invalidTagNames).length) {
                throw new KindSentryError(
                    "Invalid options",
                    Errors.InvalidInput,
                    {
                        sentryData: {
                            contexts: {
                                invalidTagNames: {
                                    ...invalidTagNames,
                                },
                            },
                        },
                    },
                );
            }
        }
    }

    setupOnce(
        addGlobalEventProcessor: (callback: SentryEventProcessor) => void,
        getCurrentHub: () => SentryHub,
    ): void {
        addGlobalEventProcessor(
            (event: SentryEvent, hint?: SentryEventHint) => {
                const self = getCurrentHub().getIntegration(KindErrorData);
                if (!self) {
                    return event;
                }
                return self.enhanceEventWithErrorData(event, hint);
            },
        );
    }

    /**
     * Attaches extracted information from the Error object to extra field in the Event
     */
    enhanceEventWithErrorData(
        event: SentryEvent,
        hint?: SentryEventHint,
    ): SentryEvent {
        const maybeError = hint?.originalException;
        // We only enhance events of type error.
        if (!(maybeError instanceof Error)) {
            return event;
        }

        // Collate the data we want to collect.
        const {tags, contexts, fingerprint} = collateSentryData(
            this._options,
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
}
