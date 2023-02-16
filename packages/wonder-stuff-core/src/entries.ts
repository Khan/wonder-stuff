/**
 * Return an array of key/value tuples for an object.
 *
 * @param {{[s: string]: T}} obj The object for which the values are
 * to be returned.
 * @returns {Array<[string, T]>} An array of key/value tuples for the object.
 */
// NOTE(kevinb): This type was copied from TypeScript's library definitions.
export const entries: {
    <T>(
        obj:
            | {
                  [s: string]: T;
              }
            | ArrayLike<T>,
    ): [string, T][];
    // eslint-disable-next-line @typescript-eslint/ban-types
    (obj: {}): [string, any][];
} = (obj: any) => Object.entries(obj);
