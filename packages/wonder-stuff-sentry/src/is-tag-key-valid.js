// @flow

// Tag keys must be no more than 32 characters long.
const MAX_TAG_KEY_LENGTH = 32;

/**
 * Determine if a tag key is valid.
 *
 * Tag keys are limited to 32 characters.
 *
 * @export
 * @param {string} tagKey The candidate tag key to be validated.
 * @returns {boolean} `true` if the tag key is valid; `false` otherwise.
 */
export function isTagKeyValid(tagKey: string): boolean {
    // Let's be defensive - if we got null at runtime, let's handle it nicely.
    return (
        tagKey != null &&
        tagKey.length > 0 &&
        tagKey.length <= MAX_TAG_KEY_LENGTH
    );
}
