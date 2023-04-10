import {getTagsFromGit} from "../get-tags-from-git";

import {execAsync} from "../exec-async";

jest.mock("../exec-async");

describe("#getTagsFromGit", () => {
    it("return an array of release tags split by new line", async () => {
        // Arrange
        jest.spyOn(require("../exec-async"), "execAsync").mockReturnValue({
            stdout: "android-7.10.0\nunified-7.8.0\nunified-7.9.0",
        });

        // Act
        const result = await getTagsFromGit();

        // Assert
        expect(result).toStrictEqual([
            "android-7.10.0",
            "unified-7.8.0",
            "unified-7.9.0",
        ]);
    });
});
