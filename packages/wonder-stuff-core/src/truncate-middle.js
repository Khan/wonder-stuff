// @flow
/**
 * Truncates a string by replacing the middle with an ellipsis.
 *
 * @export
 * @param {string} str The string to be truncated.
 * @param {number} maxLength The maximum length of a string before it must be
 * truncated.
 * @returns {string} The string, if it is less than or equal to maxLength;
 * otherwise, the string truncated to maxLength - 3 characters with an
 * ellipsis in the middle.
 */
export function truncateMiddle(str: string, maxLength: number): string {
    if (str.length <= maxLength) {
        return str;
    }

    const ELLIPSIS = "...";

    // We don't quite replace the middle with an ellipsis.
    // We use the first half of the string, and then the last half of the
    // string minus enough characters so the ellipsis can fit.
    const halfLength = Math.floor(maxLength / 2);
    const remainder = maxLength - halfLength - ELLIPSIS.length;

    const firstPart = str.substr(0, halfLength);
    const secondPart = str.substr(str.length - remainder);
    return `${firstPart}${ELLIPSIS}${secondPart}`;
}
