import {assertJest} from "./internal/assert-jest";

/**
 * Isolate imports within a given action using jest.isolateModules.
 *
 * This is a helper for the `jest.isolateModules` API, allowing
 * code to avoid the clunky closure syntax in their tests.
 *
 * @param {() => T} action The action that contains the isolated module imports.
 * We do it this way so that any `require` calls are relative to the calling
 * code and not this function. Note that we don't support promises here to
 * discourage dynamic `import` use, which doesn't play well with standard
 * jest yet.
 */
export const isolateModules = <T>(action: () => T): T => {
    assertJest();

    let result: T;
    jest.isolateModules(() => {
        result = action();
    });
    // We know that we'll have a result of the appropriate type at this point.
    // We could use a promise to make everything happy, but this doesn't need
    // to be async, so why bother.
    // @ts-expect-error [FEI-5011] - TS2454 - Variable 'result' is used before being assigned.
    return result;
};
