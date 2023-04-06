import {compareVersions, isGetReleaseBranch} from "../release-utils";

describe("#compareVersions", () => {
    it.each(["7.8.1", "7.9.0", "7.10.0", "8.0.0"])(
        "return 1 if version 1 is greater than version 2",
        (testCase: any) => {
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
        (testCase: any) => {
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

describe("#isGetReleaseBranch", () => {
    it.each([
        "release/unified/7.8.0",
        "release/android/7.8.0",
        "release/ios/7.8.0",
    ])("get the version from the release branch", (testCase: any) => {
        // Arrange
        const releaseBranch = testCase;

        // Act
        const result = isGetReleaseBranch(releaseBranch);

        // Assert
        expect(result?.version).toBe("7.8.0");
    });

    it.each(["release/testing", "android/7.8.0", "ios/7.8.0"])(
        "return null if the branch is not a release branch",
        (testCase: any) => {
            // Arrange
            const releaseBranch = testCase;

            // Act
            const result = isGetReleaseBranch(releaseBranch);

            // Assert
            expect(result).toBe(null);
        },
    );

    it("get the correct prefix string", () => {
        // Arrange
        const branchName = "release/unified/7.8.0";

        // Act
        const result = isGetReleaseBranch(branchName);

        // Assert
        expect(result?.prefix).toBe("release/unified/");
    });
});
