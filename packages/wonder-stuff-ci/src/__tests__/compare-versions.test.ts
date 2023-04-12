import {compareVersions} from "../compare-versions";

describe("#compareVersions", () => {
    it.each(["7.8.1", "7.9.0", "7.10.0", "8.0.0"])(
        "return 1 if version 1 is greater than version 2",
        (testCase: string) => {
            // Arrange
            const version1 = testCase;
            const version2 = "7.8.0";

            // Act
            const result = compareVersions(version1, version2);

            // Assert
            expect(result).toBe(1);
        },
    );

    it.each(["7.7.1", "7.6.0", "6.10.0"])(
        "return -1 if version 1 is less than version 2",
        (testCase: string) => {
            // Arrange
            const version1 = testCase;
            const version2 = "7.8.0";

            // Act
            const result = compareVersions(version1, version2);

            // Assert
            expect(result).toBe(-1);
        },
    );

    it("return 0 if version 1 is equal to version 2", () => {
        // Arrange
        const version1 = "7.8.0";
        const version2 = "7.8.0";

        // Act
        const result = compareVersions(version1, version2);

        // Assert
        expect(result).toBe(0);
    });
});
