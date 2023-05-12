type Falsy = false | 0 | "" | null | undefined;

/**
 * This is a type predicate - if `x` is "truthy", then it's `T`.
 *
 * This can be used with Array's `.filter()` method to remove non-truthy values
 * from an array, e.g.
 *
 *   const array = [0, 5, false, true, "", "hello", undefined, null];
 *   const truthyArray = array.filter(isTruthy);
 *
 * `truthyArray` will be `[5, true, "hello"]` and will have the following type:
 * `Array<string | number | true>`.
 */
export const isTruthy = <T>(x: T | Falsy): x is T => !!x;

/**
 * This is a type predicate - if `x` is neither `null` or `undefined`, then it's `T`.
 *
 * This can be used with Array's `.filter()` method to remove non-truthy
 * values from an array, e.g.
 *
 *   const array = [0, 5, false, true, "", "hello", undefined, null];
 *   const nonNullableArray = array.filter(isNonNullable);
 *
 * `nonNullableArray` will be `[0, 5, false, true, "", "hello"]` and will have the
 * following type: `Array<string | number | boolean>`.
 *
 * NOTE: The term "nullable" in TypeScript refers to either `null` or `undefined`.
 * This terminology is taken from https://www.typescriptlang.org/docs/handbook/utility-types.html#nonnullabletype.
 */
export const isNonNullable = <T>(x: T | null | undefined): x is T => x != null;
