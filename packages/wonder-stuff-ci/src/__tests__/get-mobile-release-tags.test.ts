import {getMobileReleaseTags} from "../get-mobile-release-tags";

jest.mock("../get-tags-from-git");

describe("#getMobileReleaseTags", () => {
    it("get the tags in sorted order by ascending version value", async () => {
        // Arrange
        jest.spyOn(
            require("../get-tags-from-git"),
            "getTagsFromGit",
        ).mockReturnValue(["android-7.10.0", "unified-7.8.0", "unified-7.9.0"]);

        // Act
        const result = await getMobileReleaseTags();

        // Assert
        expect(result).toStrictEqual([
            "unified-7.8.0",
            "unified-7.9.0",
            "android-7.10.0",
        ]);
    });
});
