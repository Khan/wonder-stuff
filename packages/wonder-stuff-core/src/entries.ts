/**
 * Return an array of key/value tuples for an object.
 *
 * @param {Readonly<Record<K, V>>} obj The object for which the values are
 * to be returned.
 * @returns {Array<[K, V]>} An array of key/value tuples for the object.
 */
export function entries<K extends keyof any, V>(
    obj: Readonly<Record<K, V>>,
): Array<[K, V]> {
    // This cast is deliberate as Object.entries is typed to return
    // Array<[string, mixed]>, but we want to return Array<[K, V]>.
    return Object.entries(obj) as Array<[K, V]>;
}
