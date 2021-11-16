// @flow
import {truncateMiddle} from "@khanacademy/wonder-stuff-core";

/**
 * Truncate a tag value to make sure they don't exceed the maximum length.
 *
 * Sentry tag values must be 200 characters or less. This trims the middle
 * of values that are too long, inserting an ellipsis in the middle.
 *
 * @export
 * @param {string} tagValue The value to be truncated as needed.
 * @returns {string} The tag value, if it is less than or equal to 200;
 * otherwise, the string truncated to 200 - 3 characters with an
 * ellipsis in the middle.
 */
export function truncateTagValue(tagValue: string): string {
    // Tag values must be no more than 200 characters long.
    const MAX_TAG_VALUE_LENGTH = 200;
    return truncateMiddle(tagValue, MAX_TAG_VALUE_LENGTH);
}
