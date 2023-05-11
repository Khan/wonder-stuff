import {rules} from "../../src/index";
import {RuleTester} from "../RuleTester";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
});

const ruleName = "array-type-style";
const rule = rules[ruleName];

ruleTester.run(ruleName, rule, {
    valid: [
        {
            code: "type foo = { bar: Array<number> }",
            options: ["always"],
        },
    ],
    invalid: [
        {
            code: "type foo = { bar: number[] }",
            options: ["always"],
            errors: [{messageId: "errorString"}],
            output: "type foo = { bar: Array<number> }",
        },
        {
            code: "type foo = { bar: number[][] }",
            options: ["always"],
            // Two errors are reported because there are two array types,
            // they just happen to be nested.
            errors: [{messageId: "errorString"}, {messageId: "errorString"}],
            // This is a partial fix.  Multiple runs of eslint --fix are needed
            // to fix nested (in the AST) array types completely.
            output: "type foo = { bar: Array<number>[] }",
        },
    ],
});
