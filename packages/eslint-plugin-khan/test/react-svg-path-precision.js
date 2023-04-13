const path = require("path");

const {rules} = require("../lib/index.js");
const RuleTester = require("eslint").RuleTester;

const parserOptions = {
    parser: "babel-eslint",
};

const ruleTester = new RuleTester(parserOptions);
const rule = rules["react-svg-path-precision"];

ruleTester.run("react-svg-path-precision", rule, {
    valid: [
        {
            code: '<path d="M1.23,.45L-0.98,42Z"/>',
            options: [],
        },
        {
            code: '<div><path d="M1.23,.45Z"/><path d="M1.23,0.45Z"/></div>',
            options: [],
        },
        {
            code: '<path d="M1.234,.456L-0.987,42Z"/>',
            options: [{precision: 3}],
        },
    ],
    invalid: [
        {
            code: '<path d="M1.234,.456L-0.987,42Z"/>',
            options: [],
            errors: [
                "This path contains numbers with too many decimal places.",
            ],
            output: '<path d="M1.23,0.46L-0.99,42Z"/>',
        },
        {
            code: '<div><path d="M1.234,.456Z"/><path d="M1.234,.456Z"/></div>',
            options: [],
            errors: [
                "This path contains numbers with too many decimal places.",
                "This path contains numbers with too many decimal places.",
            ],
            output: '<div><path d="M1.23,0.46Z"/><path d="M1.23,0.46Z"/></div>',
        },
        {
            code: '<path d="M1.23,0.45L-0.98,42Z"/>',
            options: [{precision: 1}],
            errors: [
                "This path contains numbers with too many decimal places.",
            ],
            output: '<path d="M1.2,0.5L-1.0,42Z"/>',
        },
    ],
});
