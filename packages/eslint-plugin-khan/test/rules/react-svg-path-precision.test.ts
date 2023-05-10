import rule from "../../src/rules/react-svg-path-precision";
import {RuleTester} from "../RuleTester";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {
            jsx: true,
        },
    },
});

ruleTester.run("react-svg-path-precision", rule, {
    valid: [
        {
            code: '<path d="M1.23,.45L-0.98,42Z"/>',
        },
        {
            code: '<div><path d="M1.23,.45Z"/><path d="M1.23,0.45Z"/></div>',
        },
        {
            code: '<path d="M1.234,.456L-0.987,42Z"/>',
            options: [{precision: 3}],
        },
    ],
    invalid: [
        {
            code: '<path d="M1.234,.456L-0.987,42Z"/>',
            errors: [{messageId: "errorMessage"}],
            output: '<path d="M1.23,0.46L-0.99,42Z"/>',
        },
        {
            code: '<div><path d="M1.234,.456Z"/><path d="M1.234,.456Z"/></div>',
            errors: [{messageId: "errorMessage"}, {messageId: "errorMessage"}],
            output: '<div><path d="M1.23,0.46Z"/><path d="M1.23,0.46Z"/></div>',
        },
        {
            code: '<path d="M1.23,0.45L-0.98,42Z"/>',
            options: [{precision: 1}],
            errors: [{messageId: "errorMessage"}],
            output: '<path d="M1.2,0.5L-1.0,42Z"/>',
        },
    ],
});
