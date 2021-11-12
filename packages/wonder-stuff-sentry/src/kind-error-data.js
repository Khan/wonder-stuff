// @flow
import type {
    SentryEvent,
    SentryEventHint,
    SentryEventProcessor,
    SentryHub,
    SentryIntegration,
    KindErrorDataOptions,
} from "./types.js";

import {collateSentryData} from "./collate-sentry-data.js";
import {DefaultKindErrorDataOptions} from "./default-kind-error-data-options.js";

export class KindErrorData implements SentryIntegration {
    static id: string = "KindErrorData";
    name: string = KindErrorData.id;
    +_options: KindErrorDataOptions;

    constructor(options: KindErrorDataOptions = DefaultKindErrorDataOptions) {
        this._options = options;
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
        event.contexts = {
            ...event.contexts,
            ...contexts,
        };

        /**
         * Fingerprint helps group like messages that otherwise would not
         * get grouped.
         */
        event.fingerprint = [...(event.fingerprint ?? []), ...fingerprint];

        return event;
    }
}
