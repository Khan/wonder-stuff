// @flow
import {extractStrings} from "../extract-i18n.js";

const TEST_FILE = `
const explanation = "I am a happy javascript file!";

// I18N: This is a single line comment
const s = i18n._("Single line");

/*
 * I18N: This is a multi-line comment.
 * But line two differs from line two in j2.js.
 */
const n = i18n.ngettext(
    "I am living in javascript-land",
    "we are living in javascript-land",
    num_people,
);

// I18N: This line is used as ngettext in j2.js
const g_here = i18n._("Am I singular or plural?");

// (This is the same as a line in j2.html.)
const v = i18n._("This line has %(vbl)s", {vbl: "variables"});

// This line is ignored.
// I18N: this content occurs in no other file.
// I18N: but this comment occurs a lot.  I repeat myself:
// I18N: this content occurs in no other file.
// This line is also ignored.
const u = i18n._("I am a unique snowflake!");

/*
 * Extra ignore me 1.
 * I18N: Include this
 * and also this
 */
const w = i18n._("Comment test 1");

/*
 * Extra ignore me 2.
 * I18N: Include this
 * and also this
 * I18N: This is also a comment.
 */
const x = i18n._("Comment test 2");

/* I18N: Multi 1. */
const xa = i18n._("Multi 1.");

/** I18N: Multi 2. */
const xb = i18n._("Multi 2.");

/**
 * I18N: Multi 3.
 */
const xc = i18n._("Multi 3.");

/**
 * I18N:
 * Multi 4.
 */
const xd = i18n._("Multi 4.");

// I18N: I'm way above the code.
if (true) {
    explanation += "stuff";
}
const y = i18n._("I'm documented above.");

// prettier-ignore
const z = i18n._("Escaped \\"quotes\\" work ok 1.");

// prettier-ignore
const za = i18n._('Escaped \\'quotes\\' work ok 2.');

// prettier-ignore
const zb = i18n._("1 Escaped last character\\\\");

// prettier-ignore
const zc = i18n._('2 Escaped last character\\\\');

// I18N:
const zd = i18n._("Ignore empty comments.");

const tmp = "* I18N: is also used where appropriate */";
const ze = i18n._("Testing correct single-line comment parsing.");

// I18N: One comment
const foo = i18n._("foo"); // I18N: should not exist
// I18N: Should exist
const bar = i18n._("bar");

Handlebars.template(\`<div>
    {{! I18N: Handlebars comment. }}
    \${i18n._("Handlebars i18n string 1.")}
</div>\`);

Handlebars.template(\`<div>
    {{! I18N: Handlebars comment trailing !. !}}
    \${i18n._("Handlebars i18n string 2.")}
</div>\`);

const zf = a._("Doesn't use i18n.");
const zg = a(b("asdf"))._("Doesn't even use a variable.");
`;

describe("extractStrings", () => {
    it("extracts strings from a file", () => {
        // Arrange
        const results = [];

        // Act
        for (const match of extractStrings(TEST_FILE)) {
            results.push(match);
        }

        // Assert
        expect(results).toMatchInlineSnapshot(`
            Array [
              Object {
                "comments": Array [
                  "This is a single line comment",
                ],
                "endOffset": 124,
                "linePos": 5,
                "msgids": Array [
                  "Single line",
                ],
                "startOffset": 111,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "This is a multi-line comment. But line two differs from line two in j2.js.",
                ],
                "endOffset": 323,
                "linePos": 11,
                "msgids": Array [
                  "I am living in javascript-land",
                  "we are living in javascript-land",
                ],
                "startOffset": 251,
                "type": "ngettext",
              },
              Object {
                "comments": Array [
                  "This line is used as ngettext in j2.js",
                ],
                "endOffset": 441,
                "linePos": 18,
                "msgids": Array [
                  "Am I singular or plural?",
                ],
                "startOffset": 415,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 529,
                "linePos": 21,
                "msgids": Array [
                  "This line has %(vbl)s",
                ],
                "startOffset": 506,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "this content occurs in no other file.",
                  "but this comment occurs a lot.  I repeat myself:",
                ],
                "endOffset": 803,
                "linePos": 28,
                "msgids": Array [
                  "I am a unique snowflake!",
                ],
                "startOffset": 777,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Include this and also this",
                ],
                "endOffset": 908,
                "linePos": 35,
                "msgids": Array [
                  "Comment test 1",
                ],
                "startOffset": 892,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Include this and also this",
                  "This is also a comment.",
                ],
                "endOffset": 1046,
                "linePos": 43,
                "msgids": Array [
                  "Comment test 2",
                ],
                "startOffset": 1030,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Multi 1.",
                ],
                "endOffset": 1099,
                "linePos": 46,
                "msgids": Array [
                  "Multi 1.",
                ],
                "startOffset": 1089,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Multi 2.",
                ],
                "endOffset": 1153,
                "linePos": 49,
                "msgids": Array [
                  "Multi 2.",
                ],
                "startOffset": 1143,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Multi 3.",
                ],
                "endOffset": 1211,
                "linePos": 54,
                "msgids": Array [
                  "Multi 3.",
                ],
                "startOffset": 1201,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Multi 4.",
                ],
                "endOffset": 1272,
                "linePos": 60,
                "msgids": Array [
                  "Multi 4.",
                ],
                "startOffset": 1262,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "I'm way above the code.",
                ],
                "endOffset": 1391,
                "linePos": 66,
                "msgids": Array [
                  "I'm documented above.",
                ],
                "startOffset": 1368,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1462,
                "linePos": 69,
                "msgids": Array [
                  "Escaped \\"quotes\\" work ok 1.",
                ],
                "startOffset": 1431,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1534,
                "linePos": 72,
                "msgids": Array [
                  "Escaped 'quotes' work ok 2.",
                ],
                "startOffset": 1503,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1603,
                "linePos": 75,
                "msgids": Array [
                  "1 Escaped last character\\\\",
                ],
                "startOffset": 1575,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1672,
                "linePos": 78,
                "msgids": Array [
                  "2 Escaped last character\\\\",
                ],
                "startOffset": 1644,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1727,
                "linePos": 81,
                "msgids": Array [
                  "Ignore empty comments.",
                ],
                "startOffset": 1703,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 1852,
                "linePos": 84,
                "msgids": Array [
                  "Testing correct single-line comment parsing.",
                ],
                "startOffset": 1806,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "One comment",
                ],
                "endOffset": 1901,
                "linePos": 87,
                "msgids": Array [
                  "foo",
                ],
                "startOffset": 1896,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Should exist",
                ],
                "endOffset": 1976,
                "linePos": 89,
                "msgids": Array [
                  "bar",
                ],
                "startOffset": 1971,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Handlebars comment.",
                ],
                "endOffset": 2084,
                "linePos": 93,
                "msgids": Array [
                  "Handlebars i18n string 1.",
                ],
                "startOffset": 2057,
                "type": "_",
              },
              Object {
                "comments": Array [
                  "Handlebars comment trailing !.",
                ],
                "endOffset": 2214,
                "linePos": 98,
                "msgids": Array [
                  "Handlebars i18n string 2.",
                ],
                "startOffset": 2187,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 2262,
                "linePos": 101,
                "msgids": Array [
                  "Doesn't use i18n.",
                ],
                "startOffset": 2243,
                "type": "_",
              },
              Object {
                "comments": Array [],
                "endOffset": 2321,
                "linePos": 102,
                "msgids": Array [
                  "Doesn't even use a variable.",
                ],
                "startOffset": 2291,
                "type": "_",
              },
            ]
        `);
    });

    it("extracted string exactly matches positions", () => {
        // Arrange
        const results = [];

        // Act
        for (const match of extractStrings(TEST_FILE)) {
            results.push(TEST_FILE.slice(match.startOffset, match.endOffset));
        }

        // Assert
        expect(results).toMatchInlineSnapshot(`
            Array [
              "\\"Single line\\"",
              "\\"I am living in javascript-land\\",
                \\"we are living in javascript-land\\"",
              "\\"Am I singular or plural?\\"",
              "\\"This line has %(vbl)s\\"",
              "\\"I am a unique snowflake!\\"",
              "\\"Comment test 1\\"",
              "\\"Comment test 2\\"",
              "\\"Multi 1.\\"",
              "\\"Multi 2.\\"",
              "\\"Multi 3.\\"",
              "\\"Multi 4.\\"",
              "\\"I'm documented above.\\"",
              "\\"Escaped \\\\\\"quotes\\\\\\" work ok 1.\\"",
              "'Escaped \\\\'quotes\\\\' work ok 2.'",
              "\\"1 Escaped last character\\\\\\\\\\"",
              "'2 Escaped last character\\\\\\\\'",
              "\\"Ignore empty comments.\\"",
              "\\"Testing correct single-line comment parsing.\\"",
              "\\"foo\\"",
              "\\"bar\\"",
              "\\"Handlebars i18n string 1.\\"",
              "\\"Handlebars i18n string 2.\\"",
              "\\"Doesn't use i18n.\\"",
              "\\"Doesn't even use a variable.\\"",
            ]
        `);
    });
});
