// @flow
import {DefaultInitOptions} from "./default-init-options.js";
import type {UnifiedSentryAPI, InitOptions} from "./types.js";

let _registeredSentry: ?UnifiedSentryAPI = null;
let _options: ?InitOptions = null;

/**
 * Indicates if the Sentry API has been initialized.
 *
 * @returns {boolean} true if the Sentry API has been initialized, otherwise
 * false.
 */
export const isInitialized = (): boolean => _registeredSentry != null;

/**
 * Initialize our Wonder Stuff Sentry support with a Sentry API and options.
 *
 * @param {UnifiedSentryAPI} sentry The Sentry API to use.
 * @param {Options} [options={kindTagName: "kind", groupByTagName: "group_by_message", concatenatedMessageTagName: "concatenated_message", causalErrorContextPrefix: "Source Error - ",}] The options to use.
 */
export const init = (
    sentry: UnifiedSentryAPI,
    options?: $Partial<InitOptions>,
): void => {
    if (sentry == null) {
        throw new Error("Cannot register a null API");
    }

    if (_registeredSentry != null) {
        throw new Error("Sentry API already registered");
    }

    _registeredSentry = sentry;
    _options = {...DefaultInitOptions, ...options};
};

/**
 * Get the initialized Sentry API.
 *
 * @returns {UnifiedSentryAPI} The initialized Sentry API.
 */
export const getSentry = (): UnifiedSentryAPI => {
    if (_registeredSentry == null) {
        throw new Error("Wonder Stuff Sentry not initialized");
    }
    return _registeredSentry;
};

/**
 * Get our initialization options.
 *
 * @returns {Options} The initialization options.
 */
export const getOptions = (): InitOptions => {
    if (_options == null) {
        throw new Error("Wonder Stuff Sentry not initialized");
    }
    return _options;
};
