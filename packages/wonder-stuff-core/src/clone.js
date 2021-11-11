// @flow

/**
 * Clone a value and all of its nested values.
 *
 * This produces a deep clone of a given value.
 *
 * @param {T} value The value to clone.
 * @returns {T} The cloned value.
 */
export const clone = <T>(value: T): T => {
    if (value != null && typeof value === "object") {
        if (Array.isArray(value)) {
            return value.map(clone);
        } else {
            return Object.keys(value).reduce((acc, key) => {
                acc[key] = clone(value[key]);
                return acc;
                // We need to cast to any here so that the value is a valid
                // match for T in the return type after the accumulator is done.
                // $FlowIgnore[unclear-type]
            }, ({}: any));
        }
    }
    return value;
};
