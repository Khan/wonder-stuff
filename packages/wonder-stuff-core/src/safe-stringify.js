// @flow

/**
 * Stringify an item, returning an empty string on error, null, or undefined.
 *
 * @param {T} value The value to be stringified.
 * @param {string} [defaultValue=""] The default value to return if the value is
 * null, undefined, or not stringifiable.
 * @returns {string} The stringified value.
 */
export const safeStringify = <T>(
    value: T,
    defaultValue: string = "",
): string => {
    if (value == null) {
        return defaultValue;
    }
    try {
        return JSON.stringify(value) ?? defaultValue;
    } catch (_) {
        return defaultValue;
    }
};
