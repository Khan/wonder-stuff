// @flow
/**
 * Builds a string that describes the causal relationship between two messages.
 *
 * @param {string} consequence The first message that describes the consequence
 * that occurred.
 * @param {string} cause The second message that describes the cause.
 * @returns {string} A string that indicates `consequence` is caused by `cause`.
 */
export const buildCausedByMessage = (
    consequence: ?string,
    cause: ?string,
): string =>
    `${consequence?.trim() || "(empty message)"}\n\tcaused by\n\t\t${
        cause?.trim() || "(empty message)"
    }`;
