// @flow
import type {KindErrorDataOptions} from "./types";

/**
 * Determine if a given tag key is a reserved tag key or not.
 *
 * @export
 * @param {KindErrorDataOptions} options Options that indicate configured tag
 * keys for use by our sentry integration.
 * @param {string} tagKey The tag key to check.
 * @returns {boolean} `true` if the tag key is a reserved tag key; otherwise,
 * `false`.
 */
export function isReservedTagKey(
    options: KindErrorDataOptions,
    tagKey: string,
): boolean {
    const RESERVED_TAG_NAMES = new Set([
        options.kindTagName,
        options.concatenatedMessageTagName,
        options.groupByTagName,
    ]);
    return RESERVED_TAG_NAMES.has(tagKey);
}
