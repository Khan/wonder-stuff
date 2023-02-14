/**
 * Clone a value and all of its nested values.
 *
 * This produces a deep clone of a given value.
 *
 * @param {T} value The value to clone.
 * @returns {T} The cloned value.
 */
export const clone = <T>(value: T): T => {
    if (value == null || typeof value !== "object") {
        return value;
    }

    if (Array.isArray(value)) {
        // @ts-expect-error [FEI-5011] - TS2322 - Type 'any[]' is not assignable to type 'T'.
        return value.map(clone);
    }

    return Object.keys(value).reduce((acc, key) => {
        // @ts-expect-error [FEI-5011] - TS7053 - Element implicitly has an 'any' type because expression of type 'string' can't be used to index type 'unknown'.
        acc[key] = clone(value[key]);
        return acc;
        // We need to cast to any here so that the value is a valid
        // match for T in the return type after the accumulator is done.
    }, {} as any);
};
