// @flow
import type {UnifiedSentryAPI} from "./types.js";

let _registeredSentry: ?UnifiedSentryAPI = null;
let _options: ?Options = null;

type Options = {
    kindTagName: string,
    groupByTagName: string,
    concatenatedMessageTagName: string,
    causalErrorContextPrefix: string,
};

const DefaultOptions: Options = {
    kindTagName: "kind",
    groupByTagName: "group_by_message",
    concatenatedMessageTagName: "concatenated_message",
    causalErrorContextPrefix: "Source Error - ",
};

/**
 * Initialize our Wonder Stuff Sentry support with a Sentry API and options.
 *
 * @param {UnifiedSentryAPI} sentry The Sentry API to use.
 * @param {Options} [options={kindTagName: "kind", groupByTagName: "group_by_message", concatenatedMessageTagName: "concatenated_message", causalErrorContextPrefix: "Source Error - ",}] The options to use.
 */
export const init = (
    sentry: UnifiedSentryAPI,
    options?: $Partial<Options>,
): void => {
    if (sentry == null) {
        throw new Error("Cannot register a null API");
    }

    if (_registeredSentry != null) {
        throw new Error("Sentry API already registered");
    }

    _registeredSentry = sentry;
    _options = {...DefaultOptions, ...options};
};

/**
 * Get the initialized Sentry API.
 */
export const getSentry = (): UnifiedSentryAPI => {
    if (_registeredSentry == null) {
        throw new Error("Wonder Stuff Sentry not initialized");
    }
    return _registeredSentry;
};

/**
 * Get our initialization options.
 */
export const getOptions = (): Options => {
    if (_options == null) {
        throw new Error("Wonder Stuff Sentry not initialized");
    }
    return _options;
};
