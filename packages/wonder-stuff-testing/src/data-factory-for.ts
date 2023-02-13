import {clone} from "@khanacademy/wonder-stuff-core";

/**
 * dataFactoryFor(defaultObject)
 *
 * Returns a new factory function that returns can be called to obtain
 * a copy of `defaultObject`.  Optionally, the factory function can be
 * passed a `partialObject` in which case it will return a copy of the
 * merged object.
 *
 * Any properties appearing in `partialObject` must be complete
 * objects.  If you want to update a deeply nested property by
 * itself, you can do so by directly modifying the object.  This is
 * safe because
 *
 * This
 * can still be a bit awkward since there may be a number of optionals
 * that you have to check before setting the value.
 *
 * Example (shallow override):
 *     const BASE_OBJECT = {
 *         student: { ... },
 *         teacher: { ... },
 *     };
 *     const dataFactory = dataFactoryFor(BASE_OBJECT);
 *     const data = dataFactory({
 *         student: {
 *             __typename: "User",
 *             id: "new_kaid",
 *             kaid: "new_kaid",
 *             ... other properties on `user`
 *         }
 *     });
 *
 * Example (deep update):
 *     const BASE_OBJECT = {
 *         student: { ... },
 *         teacher: { ... },
 *     };
 *     const dataFactory = dataFactoryFor(BASE_OBJECT);
 *     const data = dataFactory();
 *     if (data.user) {
 *         data.user.kaid = "new_kaid";
 *         data.user.id = "new_kaid";
 *     }
 */
export const dataFactoryFor =
    <T>(baseObject: T): ((partialObject?: Partial<T>) => T) =>
    <T>(
        // $FlowIgnore[incompatible-type]: Flow thinks that {} can't be assigned to Partial<T>
        partialObject: Partial<T> = Object.freeze({}),
    ): T => {
        // NOTE: we clone the result to prevent tests from modifying
        // either `defaultObject` or `partialObject` when performing
        // deep updates on the return object returned by the factory.
        // @ts-expect-error [FEI-5011] - TS2322 - Type 'T & Partial<T>' is not assignable to type 'T'.
        return clone({...baseObject, ...partialObject});
    };
