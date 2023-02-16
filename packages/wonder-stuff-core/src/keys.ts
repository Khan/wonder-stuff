/**
 * Return an array of the enumerable keys of an object.
 *
 * @param {$ReadOnly<interface {[string]: mixed}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<$Keys<O>>} An array of the enumerable keys of an object.
 */
// NOTE(kevinb): This type was copied from TypeScript's library definitions.
// eslint-disable-next-line @typescript-eslint/ban-types
export function keys(obj: {}): string[] {
    return Object.keys(obj);
}
