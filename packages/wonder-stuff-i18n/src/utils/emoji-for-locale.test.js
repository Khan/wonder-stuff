// @flow
import {getEmojiForLocale} from "./emoji-for-locale.js";

describe("getEmojiForLocale", () => {
    it("returns an emoji for boxes", () => {
        // Arrange
        const locale = "boxes";

        // Act
        const result = getEmojiForLocale(locale);

        // Assert
        expect(result).toEqual("📦");
    });

    it("returns an emoji for es", () => {
        // Arrange
        const locale = "es";

        // Act
        const result = getEmojiForLocale(locale);

        // Assert
        expect(result).toEqual("🇲🇽");
    });

    it("handles an unknown locale", () => {
        // Arrange
        const locale = "asdf";

        // Act
        const result = getEmojiForLocale(locale);

        // Assert
        expect(result).toEqual("");
    });
});
