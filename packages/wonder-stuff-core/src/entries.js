// @flow
/**
 * Return an array of key/value tuples for an object.
 *
 * @param {$ReadOnly<interface {[K]: V}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<[K, V]>} An array of key/value tuples for the object.
 */
export function entries<K, V>(
    obj: $ReadOnly<interface {[K]: V}>,
): Array<[K, V]> {
    // This cast is deliberate as Object.entries is typed to return
    // Array<[string, mixed]>, but we want to return Array<[K, V]>.
    // $FlowIgnore[unclear-type]
    return (Object.entries(obj): any);
}
