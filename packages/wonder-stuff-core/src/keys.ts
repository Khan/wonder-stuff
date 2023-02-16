/**
 * Return an array of the enumerable keys of an object.
 *
 * @param {Readonly<Record<string, unknown>>} obj The object for which the values are
 * to be returned.
 * @returns {Array<keyof O>} An array of the enumerable keys of an object.
 */
export function keys<O extends Record<string, unknown>>(
    obj: Readonly<O>,
): Array<keyof O> {
    return Object.keys(obj);
}
