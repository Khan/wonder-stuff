// @flow

/**
 * Options to modify how a safe stringifying operation works.
 */
type SafeStringifyOptions = {
    /**
     * A default string to use if the value cannot be stringified.
     *
     * @default '""' Empty string
     * @type {string}
     */
    defaultValue?: string,

    /**
     * A number indicating how many spaces to indent nested structures.
     * When not given, there will be no indentation nor additional newlines.
     *
     * @default undefined No indentation
     * @type {?number}
     */
    indent?: ?number,
};

interface safeStringifyFn {
    /**
     * Stringify an item, returning an empty string on error, null, or undefined.
     *
     * @param {T} value The value to be stringified.
     * @param {SafeStringifyOptions} [options] Options to modify the output.
     * @param {string} [options.defaultValue = ""] A default value to return
     * if the value to be stringified cannot be stringified.
     * @param {string} [options.indent = undefined] A number indicating how
     * many spaces to indent nested structures. When specified, values are
     * stringified over multiple lines indented the specified amount for each
     * scope of the object.
     * @returns {string} The stringified value or the default value.
     */
    <T>(value: T, options?: SafeStringifyOptions): string;

    /**
     * Stringify an item, returning an empty string on error, null, or undefined.
     *
     * @param {T} value The value to be stringified.
     * @param {string} [defaultValue=""] The default value to return if the value is
     * null, undefined, or not stringifiable.
     * @returns {string} The stringified value.
     */
    <T>(value: T, defaultValue?: string): string;
}

const getOptionsFromArg = (
    defaultValueOrOptions: string | SafeStringifyOptions,
): SafeStringifyOptions => {
    if (
        defaultValueOrOptions == null ||
        typeof defaultValueOrOptions === "string"
    ) {
        return {
            defaultValue: defaultValueOrOptions,
        };
    }

    return defaultValueOrOptions;
};

export const safeStringify: safeStringifyFn = <T>(
    value: T,
    defaultValueOrOptions: string | SafeStringifyOptions = "",
): string => {
    const {defaultValue = "", indent} = getOptionsFromArg(
        defaultValueOrOptions,
    );
    if (value == null) {
        return defaultValue;
    }
    try {
        return JSON.stringify(value, null, indent ?? 0) ?? defaultValue;
    } catch (_) {
        return defaultValue;
    }
};
