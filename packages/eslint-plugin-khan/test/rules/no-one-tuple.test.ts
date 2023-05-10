import rule from "../../src/rules/no-one-tuple";
import {RuleTester} from "../RuleTester";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
});

ruleTester.run("flow-no-one-tuple", rule, {
    valid: [
        {
            code: "type foo = { bar: Array<number> }",
            options: ["always"],
        },
        {
            code: "type foo = { bar: [number, number] }",
            options: ["always"],
        },
    ],
    invalid: [
        {
            code: "type foo = { bar: [number] }",
            options: ["always"],
            errors: [{messageId: "errorString"}],
            output: "type foo = { bar: Array<number> }",
        },
        {
            code: "type foo = { bar: [[number]] }",
            options: ["always"],
            // Two errors are reported because there are two one-tuples,
            // they just happen to be nested.
            errors: [{messageId: "errorString"}, {messageId: "errorString"}],
            // This is a partial fix.  Multiple runs of eslint --fix are needed
            // to fix nested 1-tuples completely.
            output: "type foo = { bar: Array<[number]> }",
        },
    ],
});
