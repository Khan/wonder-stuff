/**
 * Builds a string that describes the causal relationship between two messages.
 *
 * @param {string} consequence The first message that describes the consequence
 * that occurred.
 * @param {string} cause The second message that describes the cause.
 * @returns {string} A string that indicates `consequence` is caused by `cause`.
 */
export const buildCausedByMessage = (
    consequence?: string | null,
    cause?: string | null,
): string => {
    const messageOrDefault = (message?: string | null): string =>
        message?.trim() || "(empty message)";

    const consequenceMessage = messageOrDefault(consequence);
    if (cause == null) {
        return consequenceMessage;
    }

    return `${consequenceMessage}\n\tcaused by\n\t\t${messageOrDefault(cause)}`;
};
