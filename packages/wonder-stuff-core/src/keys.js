// @flow
/**
 * Return an array of the enumerable keys of an object.
 *
 * @param {$ReadOnly<interface {[string]: mixed}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<$Keys<O>>} An array of the enumerable keys of an object.
 */
export function keys<O: interface {[string]: mixed}>(
    obj: $ReadOnly<O>,
): Array<$Keys<O>> {
    return Object.keys(obj);
}
