import {getMobileReleaseLogger} from "../get-mobile-release-logger";

describe("#getMobileReleaseLogger", () => {
    it("return the mobile release logger", () => {
        // Act
        const result = getMobileReleaseLogger();

        // Assert
        expect(result).toBeTruthy();
        expect(result.level).toStrictEqual("info");
    });
});
