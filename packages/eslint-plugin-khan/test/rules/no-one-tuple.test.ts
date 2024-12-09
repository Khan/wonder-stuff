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

const ruleName = "no-one-tuple";
const rule = rules[ruleName];

ruleTester.run(ruleName, rule, {
    valid: [
        {
            code: "type foo = { bar: Array<number> }",
        },
        {
            code: "type foo = { bar: [number, number] }",
        },
    ],
    invalid: [
        {
            code: "type foo = { bar: [number] }",
            errors: [{messageId: "errorString"}],
            output: "type foo = { bar: Array<number> }",
        },
        {
            code: "type foo = { bar: [[number]] }",
            // Two errors are reported because there are two one-tuples,
            // they just happen to be nested.
            errors: [{messageId: "errorString"}, {messageId: "errorString"}],
            output: [
                "type foo = { bar: Array<[number]> }",
                "type foo = { bar: Array<Array<number>> }",
            ],
        },
    ],
});
