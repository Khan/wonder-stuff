// @flow
// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "../types";
import {getRuntimeMode} from "../get-runtime-mode";

describe("#getRuntimeMode", () => {
    const NODE_ENV = process.env.NODE_ENV;

    afterEach(() => {
        process.env.NODE_ENV = NODE_ENV;
    });

    it.each([
        [Runtime.Production, "prod"],
        [Runtime.Production, "production"],
        [Runtime.Development, "dev"],
        [Runtime.Development, "development"],
        [Runtime.Test, "test"],
    ])("should return %s for given %s", (expectation, nodeEnv) => {
        // Arrange
        process.env.NODE_ENV = nodeEnv;

        // Act
        const result = getRuntimeMode(Runtime.Development);

        // Assert
        expect(result).toBe(expectation);
    });

    it.each([
        [Runtime.Production, undefined],
        [Runtime.Development, undefined],
        [Runtime.Production, "blah"],
        [Runtime.Development, "blah"],
    ])("should return %s if NODE_ENV unrecognised", (expectation, nodeEnv) => {
        // Arrange
        process.env.NODE_ENV = nodeEnv;

        // Act
        const result = getRuntimeMode(expectation);

        // Assert
        expect(result).toBe(expectation);
    });

    it.each([
        [Runtime.Development, "development"],
        [Runtime.Production, "production"],
        [Runtime.Development, "test"],
        [Runtime.Production, "test"],
    ])(
        "should ignore default of %s and give precedent to NODE_ENV=%s",
        (defaultValue, nodeEnv) => {
            // Arrange
            process.env.NODE_ENV = nodeEnv;

            // Act
            const result = getRuntimeMode(defaultValue);

            // Assert
            expect(result).toBe(nodeEnv);
        },
    );
});
