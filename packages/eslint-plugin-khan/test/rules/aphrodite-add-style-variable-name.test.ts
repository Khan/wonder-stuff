import {RuleTester} from "@typescript-eslint/rule-tester";

import {rules} from "../../src/index";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 6,
            sourceType: "module",
            ecmaFeatures: {},
        },
    },
    linterOptions: {
        // NOTE(kevinb): Avoids 'TypeError: Expected a Boolean' error
        // when running the tests.
        reportUnusedDisableDirectives: true,
    },
});

const ruleName = "aphrodite-add-style-variable-name";
const rule = rules[ruleName];

ruleTester.run(ruleName, rule, {
    valid: [
        {
            code: `const StyledDiv = addStyle("div")`,
        },
        {
            code: `const StyledSpan = addStyle("span")`,
        },
        {
            code: `const StyledImg = addStyle("img")`,
        },
        {
            code: `const StyledUl = addStyle("ul")`,
        },
        {
            code: `const StyledOl = addStyle("ol")`,
        },
        {
            code: `const StyledLi = addStyle("li")`,
        },
        {
            code: `const StyledButton = addStyle("button")`,
        },
        {
            code: `const StyledP = addStyle("p")`,
        },
        {
            code: `const StyledSup = addStyle("sup")`,
        },
        {
            // Handling custom html components
            code: `const StyledFooBar = addStyle("foo-bar")`,
        },
    ],
    invalid: [
        {
            code: `const foo = addStyle("div")`,
            errors: [
                {
                    messageId: "errorString",
                    data: {
                        variableName: "foo",
                        tagName: "div",
                        expectedName: "StyledDiv",
                    },
                },
            ],
        },
        {
            code: `const div = addStyle("div")`,
            errors: [
                {
                    messageId: "errorString",
                    data: {
                        variableName: "div",
                        tagName: "div",
                        expectedName: "StyledDiv",
                    },
                },
            ],
        },
        {
            code: `const span = addStyle("span")`,
            errors: [
                {
                    messageId: "errorString",
                    data: {
                        variableName: "span",
                        tagName: "span",
                        expectedName: "StyledSpan",
                    },
                },
            ],
        },
        {
            code: `const p = addStyle("p")`,
            errors: [
                {
                    messageId: "errorString",
                    data: {
                        variableName: "p",
                        tagName: "p",
                        expectedName: "StyledP",
                    },
                },
            ],
        },
        {
            code: `const styledDiv = addStyle("div")`,
            errors: [
                {
                    messageId: "errorString",
                    data: {
                        variableName: "styledDiv",
                        tagName: "div",
                        expectedName: "StyledDiv",
                    },
                },
            ],
        },
    ],
});
