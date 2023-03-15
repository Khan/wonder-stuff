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
    ])("should return %s for given %s", (expectation: any, nodeEnv: any) => {
        // Arrange
        process.env.NODE_ENV = nodeEnv;

        // Act
        const result = getRuntimeMode();

        // Assert
        expect(result).toBe(expectation);
    });

    it.each([undefined, "blah"])(
        "should return development if NODE_ENV unrecognised",
        (nodeEnv: any) => {
            // Arrange
            process.env.NODE_ENV = nodeEnv;

            // Act
            const result = getRuntimeMode();

            // Assert
            expect(result).toBe(Runtime.Development);
        },
    );
});
