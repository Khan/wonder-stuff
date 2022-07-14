// @flow
/**
 * Return an array of the enumerable property values of an object.
 *
 * @param {$ReadOnly<interface {[mixed]: V}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<V>} An array of the enumerable property values of the object.
 */
export function values<V>(obj: $ReadOnly<interface {[mixed]: V}>): Array<V> {
    // This is a deliberate cast through any.
    // Object.values returns Array<mixed> and we want to return Array<V>.
    // $FlowIgnore[unclear-type]
    return (Object.values(obj): Array<any>);
}
