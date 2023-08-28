/* istanbul ignore file */
import * as JestGlobals from "@jest/globals";

/**
 * Wrap the jest `afterEach` function.
 *
 * This makes it easy to mock this in our tests without jest getting upset.
 */
export const afterEach: typeof JestGlobals.afterEach = (...args) =>
    JestGlobals.afterEach(...args);
