import {extractMobileReleaseInfoFromBranchName} from "../extract-mobile-release-info-from-branch-name";

describe("#extractMobileReleaseInfoFromBranchName", () => {
    it.each([
        "release/unified/7.8.0",
        "release/android/7.8.0",
        "release/ios/7.8.0",
    ])("get the version from the release branch", (testCase: string | null) => {
        // Arrange
        const releaseBranch = testCase;

        // Act
        const result = extractMobileReleaseInfoFromBranchName(releaseBranch);

        // Assert
        expect(result?.version).toBe("7.8.0");
    });

    it.each(["release/testing", "android/7.8.0", "ios/7.8.0", null])(
        "return null if the branch is not a release branch",
        (testCase: string | null) => {
            // Arrange
            const releaseBranch = testCase;

            // Act
            const result =
                extractMobileReleaseInfoFromBranchName(releaseBranch);

            // Assert
            expect(result).toBe(null);
        },
    );

    it("get the correct prefix string", () => {
        // Arrange
        const branchName = "release/unified/7.8.0";

        // Act
        const result = extractMobileReleaseInfoFromBranchName(branchName);

        // Assert
        expect(result?.prefix).toBe("release/unified/");
    });
});
