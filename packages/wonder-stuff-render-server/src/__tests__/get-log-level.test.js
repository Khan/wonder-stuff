// @flow
import {getLogLevel} from "../get-log-level";

describe("#getLogLevel", () => {
    let KA_LOG_LEVEL;
    beforeEach(() => {
        KA_LOG_LEVEL = process.env.KA_LOG_LEVEL;
    });

    afterEach(() => {
        process.env.KA_LOG_LEVEL = KA_LOG_LEVEL;
    });

    it("should return level defined by KA_LOG_LEVEL", () => {
        // Arrange
        process.env.KA_LOG_LEVEL = "silly";

        // Act
        const result = getLogLevel();

        // Assert
        expect(result).toBe("silly");
    });

    it("should return debug when KA_LOG_LEVEL not given", () => {
        // Arrange
        process.env.KA_LOG_LEVEL = undefined;

        // Act
        const result = getLogLevel();

        // Assert
        expect(result).toBe("debug");
    });
});
