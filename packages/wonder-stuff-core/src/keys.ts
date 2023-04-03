/**
 * Return an array of the enumerable keys of an object.
 *
 * @param {object} obj The object for which the values are
 * to be returned.
 * @returns {Array<$Keys<O>>} An array of the enumerable keys of an object.
 */
// NOTE(kevinb): This type was copied from TypeScript's library definitions.
export function keys<O extends object>(obj: O): Array<keyof O> {
    return Object.keys(obj) as Array<keyof O>;
}
