/**
 * Coerce a buffer or string into a string.
 *
 * @param {Buffer | string} input The `Buffer` or `string`
 * that should be coerced to a string.
 * @returns {string} The `string` representation of the given parameter.
 */
export const bufferToString = (input: Buffer | string): string => {
    return typeof input === "string" ? input : input.toString("utf8");
};
