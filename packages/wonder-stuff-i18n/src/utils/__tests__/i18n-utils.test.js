// @flow
import fs from "fs";

import {
    getIgnoreGlobs,
    getI18nStringsFromString,
    translateString,
} from "../i18n-utils.js";

jest.mock("ancesdir");

describe("getIgnoreGlobs", () => {
    it("reads from a .i18nignore file", () => {
        // Arrange
        const expectedGlobs = ["foo.js", "bar.js", "*_test.js"];
        const ancesdir = require("ancesdir");
        ancesdir.mockReturnValue(__dirname);
        jest.spyOn(fs, "readFileSync").mockReturnValue(
            expectedGlobs.join("\n"),
        );

        // Act
        const result = getIgnoreGlobs();

        // Assert
        expect(result).toEqual(expectedGlobs);
    });

    it("returns nothing if no .i18nignore file is found", () => {
        // Arrange
        const expectedGlobs = [];
        const ancesdir = require("ancesdir");
        ancesdir.mockImplementation(() => {
            throw new Error("No such file");
        });

        // Act
        const result = getIgnoreGlobs();

        // Assert
        expect(result).toEqual(expectedGlobs);
    });

    it("removes whitespace, empty lines, and comments", () => {
        // Arrange
        const expectedGlobs = ["foo.js", "bar.js", "*_test.js"];
        const ancesdir = require("ancesdir");
        ancesdir.mockReturnValue(__dirname);
        jest.spyOn(fs, "readFileSync").mockReturnValue(`
# This is a comment
  # And me too!
     foo.js # comment
 bar.js
# bar.js
# More comments
 *_test.js

`);

        // Act
        const result = getIgnoreGlobs();

        // Assert
        expect(result).toEqual(expectedGlobs);
    });
});

describe("getI18nStringsFromString", () => {
    it("extracts strings for translation", () => {
        // Arrange
        const fileContents = `i18n._("Hello");\ni18n._("World");`;

        // Act
        const strings = getI18nStringsFromString(fileContents);

        // Assert
        expect(strings).toMatchInlineSnapshot(`
            [
              {
                "comments": [],
                "endOffset": 31,
                "linePos": 2,
                "msgids": [
                  "World",
                ],
                "startOffset": 24,
                "type": "_",
              },
              {
                "comments": [],
                "endOffset": 14,
                "linePos": 1,
                "msgids": [
                  "Hello",
                ],
                "startOffset": 7,
                "type": "_",
              },
            ]
        `);
    });
});

describe("translateString", () => {
    it("replaces translatable strings", () => {
        // Arrange
        const fileContents = `i18n._("Hello");\ni18n._("World");`;
        const translation = {
            Hello: "Hallo",
            World: "Welt",
        };

        // Act
        const translatedFileContents = translateString(
            fileContents,
            translation,
        );

        // Assert
        expect(translatedFileContents).toEqual(
            `i18n._("Hallo");\ni18n._("Welt");`,
        );
    });

    it("leaves un-translatable strings", () => {
        // Arrange
        const fileContents = `i18n._("Hello");\ni18n._("World");`;
        const translation = {
            Hello: "Hallo",
        };

        // Act
        const translatedFileContents = translateString(
            fileContents,
            translation,
        );

        // Assert
        expect(translatedFileContents).toEqual(
            `i18n._("Hallo");\ni18n._("World");`,
        );
    });

    it("can take pre-extracted strings", () => {
        // Arrange
        const fileContents = `i18n._("Hello");\ni18n._("World");`;
        const translation = {
            Hello: "Hallo",
            World: "Welt",
        };
        const strings = getI18nStringsFromString(fileContents);

        // Act
        const translatedFileContents = translateString(
            fileContents,
            translation,
            strings,
        );

        // Assert
        expect(translatedFileContents).toEqual(
            `i18n._("Hallo");\ni18n._("Welt");`,
        );
    });
});
