// @flow
/**
 * Return an array of the enumerable keys of an object.
 *
 * @param {$ReadOnly<{[string]: V}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<$Keys<O>>} An array of the enumerable keys of an object.
 */
export function keys<V, O: {[string]: V}>(obj: O): Array<$Keys<O>> {
    return Object.keys(obj);
}
