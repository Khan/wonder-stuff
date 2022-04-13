// @flow
import fs from "fs";
import path from "path";

import fglob from "fast-glob";

import {
    buildPoItem,
    mergePoItem,
    getPoItemMap,
    getFilesToExtractFrom,
    getPOTFileStringFromFiles,
} from "./pofile-utils.js";
import * as I18nUtils from "./i18n-utils.js";

describe("buildPoItem", () => {
    it("builds a PO item from an extracted string", () => {
        // Arrange
        const fileName = "test/some-file.js";
        const extractedString = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string"],
            comments: [],
        };

        // Act
        const result = buildPoItem(fileName, extractedString);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [],
              "flags": Object {},
              "msgctxt": null,
              "msgid": "an extracted english string",
              "msgid_plural": null,
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file.js:10",
              ],
            }
        `);
    });

    it("builds a PO item from an extracted plural string", () => {
        // Arrange
        const fileName = "test/some-file.js";
        const extractedString = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "ngettext",
            msgids: ["%(num)s english string", "%(num)s plural string"],
            comments: [],
        };

        // Act
        const result = buildPoItem(fileName, extractedString);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [],
              "flags": Object {
                "python-format": true,
              },
              "msgctxt": null,
              "msgid": "%(num)s english string",
              "msgid_plural": "%(num)s plural string",
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file.js:10",
              ],
            }
        `);
    });

    it("builds a PO item from an extracted string with variable", () => {
        // Arrange
        const fileName = "test/some-file.js";
        const extractedString = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string %(name)s"],
            comments: [],
        };

        // Act
        const result = buildPoItem(fileName, extractedString);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [],
              "flags": Object {
                "python-format": true,
              },
              "msgctxt": null,
              "msgid": "an extracted english string %(name)s",
              "msgid_plural": null,
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file.js:10",
              ],
            }
        `);
    });

    it("builds a PO item with comments", () => {
        // Arrange
        const fileName = "test/some-file.js";
        const extractedString = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string"],
            comments: ["a simple comment"],
        };

        // Act
        const result = buildPoItem(fileName, extractedString);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [
                "a simple comment",
              ],
              "flags": Object {},
              "msgctxt": null,
              "msgid": "an extracted english string",
              "msgid_plural": null,
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file.js:10",
              ],
            }
        `);
    });
});

describe("mergePoItem", () => {
    it("merges two PO items", () => {
        // Arrange
        const fileName1 = "test/some-file1.js";
        const extractedString1 = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string"],
            comments: [],
        };
        const item1 = buildPoItem(fileName1, extractedString1);
        const fileName2 = "test/some-file2.js";
        const extractedString2 = {
            linePos: 12,
            startOffset: 200,
            endOffset: 229,
            type: "_",
            msgids: ["an extracted english string"],
            comments: [],
        };

        // Act
        mergePoItem(item1, fileName2, extractedString2);

        // Assert
        expect(item1).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [],
              "flags": Object {},
              "msgctxt": null,
              "msgid": "an extracted english string",
              "msgid_plural": null,
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file1.js:10 test/some-file2.js:12",
              ],
            }
        `);
    });

    it("merges two PO items with comments", () => {
        // Arrange
        const fileName1 = "test/some-file1.js";
        const extractedString1 = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string"],
            comments: ["comment 1"],
        };
        const item1 = buildPoItem(fileName1, extractedString1);
        const fileName2 = "test/some-file2.js";
        const extractedString2 = {
            linePos: 12,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["an extracted english string"],
            comments: ["comment 2"],
        };

        // Act
        mergePoItem(item1, fileName2, extractedString2);

        // Assert
        expect(item1).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [
                "comment 2",
                "comment 1",
              ],
              "flags": Object {},
              "msgctxt": null,
              "msgid": "an extracted english string",
              "msgid_plural": null,
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file1.js:10 test/some-file2.js:12",
              ],
            }
        `);
    });

    it("merges two plural PO items", () => {
        // Arrange
        const fileName1 = "test/some-file1.js";
        const extractedString1 = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "ngettext",
            msgids: ["a singular string", "a plural string"],
            comments: [],
        };
        const item1 = buildPoItem(fileName1, extractedString1);
        const fileName2 = "test/some-file2.js";
        const extractedString2 = {
            linePos: 12,
            startOffset: 200,
            endOffset: 229,
            type: "ngettext",
            msgids: ["a singular string", "a plural string"],
            comments: [],
        };

        // Act
        mergePoItem(item1, fileName2, extractedString2);

        // Assert
        expect(item1).toMatchInlineSnapshot(`
            Object {
              "comments": Array [],
              "extractedComments": Array [],
              "flags": Object {},
              "msgctxt": null,
              "msgid": "a singular string",
              "msgid_plural": "a plural string",
              "msgstr": Array [],
              "nplurals": 2,
              "obsolete": false,
              "references": Array [
                "test/some-file1.js:10 test/some-file2.js:12",
              ],
            }
        `);
    });

    it("errors out when attempting to merge a plural and a singular string", () => {
        // Arrange
        const fileName1 = "test/some-file1.js";
        const extractedString1 = {
            linePos: 10,
            startOffset: 100,
            endOffset: 129,
            type: "_",
            msgids: ["a singular string"],
            comments: [],
        };
        const item1 = buildPoItem(fileName1, extractedString1);
        const fileName2 = "test/some-file2.js";
        const extractedString2 = {
            linePos: 12,
            startOffset: 200,
            endOffset: 229,
            type: "ngettext",
            msgids: ["a singular string", "a plural string"],
            comments: [],
        };
        const errorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const exitSpy = jest
            .spyOn(process, "exit")
            .mockImplementation(() => {});

        // Act
        mergePoItem(item1, fileName2, extractedString2);

        // Assert
        expect(errorSpy).toHaveBeenCalled();
        expect(exitSpy).toHaveBeenCalledWith(1);
    });
});

describe("getPoItemMap", () => {
    it("builds a POItem Map from some files", () => {
        // Arrange
        const file1 = `
// I18N: An i18n comment
i18n._("A singular string.");

i18n.ngettext("%(num)s singular string.", "%(num)s plural string.", num);`;

        const file2 = `
i18n._("Another string.");

// I18N: A different i18n comment
i18n._("A singular string.");

// I18N: Another comment.
i18n.ngettext("%(num)s singular string.", "%(num)s plural string.", num);`;

        jest.spyOn(fs, "readFileSync")
            .mockReturnValueOnce(file1)
            .mockReturnValueOnce(file2);

        const files = [
            path.join(process.cwd(), "test1.js"),
            path.join(process.cwd(), "test2.js"),
        ];

        // Act
        const result = getPoItemMap(files);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Map {
              "A singular string." => Object {
                "comments": Array [],
                "extractedComments": Array [
                  "A different i18n comment",
                  "An i18n comment",
                ],
                "flags": Object {},
                "msgctxt": null,
                "msgid": "A singular string.",
                "msgid_plural": null,
                "msgstr": Array [],
                "nplurals": 2,
                "obsolete": false,
                "references": Array [
                  "test1.js:3 test2.js:5",
                ],
              },
              "%(num)s singular string." => Object {
                "comments": Array [],
                "extractedComments": Array [
                  "Another comment.",
                ],
                "flags": Object {
                  "python-format": true,
                },
                "msgctxt": null,
                "msgid": "%(num)s singular string.",
                "msgid_plural": "%(num)s plural string.",
                "msgstr": Array [],
                "nplurals": 2,
                "obsolete": false,
                "references": Array [
                  "test1.js:5 test2.js:8",
                ],
              },
              "Another string." => Object {
                "comments": Array [],
                "extractedComments": Array [],
                "flags": Object {},
                "msgctxt": null,
                "msgid": "Another string.",
                "msgid_plural": null,
                "msgstr": Array [],
                "nplurals": 2,
                "obsolete": false,
                "references": Array [
                  "test2.js:2",
                ],
              },
            }
        `);
    });
});

describe("getFilesToExtractFrom", () => {
    it("uses a glob to find files to extract from", () => {
        // Arrange
        jest.spyOn(I18nUtils, "getIgnoreGlobs").mockReturnValue([]);
        jest.spyOn(fglob, "sync").mockReturnValue([
            "a1.js",
            "a1_test.js",
            "a1.fixture.js",
        ]);

        // Act
        const result = getFilesToExtractFrom(["a1*.js"]);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            Array [
              "a1.fixture.js",
              "a1.js",
              "a1_test.js",
            ]
        `);
    });
});

describe("getPOTFileStringFromFiles", () => {
    it("builds a POT file from some files with i18n strings", () => {
        // Arrange
        const file1 = `
// I18N: An i18n comment
i18n._("A singular string.");

i18n.ngettext("%(num)s singular string.", "%(num)s plural string.", num);`;

        const file2 = `
i18n._("Another string.");

// I18N: A different i18n comment
i18n._("A singular string.");

// I18N: Another comment.
i18n.ngettext("%(num)s singular string.", "%(num)s plural string.", num);`;

        jest.spyOn(fs, "readFileSync")
            .mockReturnValueOnce(file1)
            .mockReturnValueOnce(file2);

        const files = [
            path.join(process.cwd(), "test1.js"),
            path.join(process.cwd(), "test2.js"),
        ];

        // Act
        const result = getPOTFileStringFromFiles(files);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            "msgid \\"\\"
            msgstr \\"\\"

            #. A different i18n comment
            #. An i18n comment
            #: test1.js:3 test2.js:5
            msgid \\"A singular string.\\"
            msgstr \\"\\"

            #. Another comment.
            #: test1.js:5 test2.js:8
            #, python-format
            msgid \\"%(num)s singular string.\\"
            msgid_plural \\"%(num)s plural string.\\"
            msgstr[0] \\"\\"
            msgstr[1] \\"\\"

            #: test2.js:2
            msgid \\"Another string.\\"
            msgstr \\"\\"
            "
        `);
    });
});
