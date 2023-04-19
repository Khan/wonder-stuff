/**
 * Return an array of the enumerable property values of an object.
 *
 * @param {Readonly<{[K: mixed]: V}>} obj The object for which the values are
 * to be returned.
 * @returns {Array<V>} An array of the enumerable property values of the object.
 */
// NOTE(kevinb): This type was copied from TypeScript's library definitions.
export const values: {
    <T>(
        obj:
            | {
                  [s: string]: T;
              }
            | ArrayLike<T>,
    ): T[];
    // eslint-disable-next-line @typescript-eslint/ban-types
    (obj: {}): any[];
} = (obj: any) => Object.values(obj);
