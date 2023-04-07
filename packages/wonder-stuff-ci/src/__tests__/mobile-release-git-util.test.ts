import {allMobileReleaseTags} from "../mobile-release-git-utils";
import execProm from "../exec-prom";

jest.mock("../exec-prom");

describe("#allMobileReleaseTags", () => {
    it("return an array of release tags split by new line", async () => {
        // Arrange
        jest.spyOn(require("../exec-prom"), "execProm").mockReturnValue({
            stdout: "android-7.10.0\nunified-7.8.0\nunified-7.9.0",
        });
        // Act
        const result = await allMobileReleaseTags();

        // Assert
        expect(result).toStrictEqual([
            "android-7.10.0",
            "unified-7.8.0",
            "unified-7.9.0",
        ]);
    });
});
