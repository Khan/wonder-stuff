import {RuleTester} from "@typescript-eslint/rule-tester";

import {rules} from "../../src/index";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 6,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    linterOptions: {
        // NOTE(kevinb): Avoids 'TypeError: Expected a Boolean' error
        // when running the tests.
        reportUnusedDisableDirectives: true,
    },
});

const ruleName = "ts-no-error-suppressions";
const rule = rules[ruleName];

ruleTester.run(ruleName, rule, {
    valid: [
        {
            code: `
            const foo = <Foo
                bar="bar"
                baz={baz}
            />`,
        },
        {
            code: `
            // @ts-expect-error: on JSXElement
            const foo = <Foo
                bar="bar"
                baz={baz}
            />`,
        },
        {
            code: `
            // @ts-ignore: on JSXElement
            const foo = <Foo
                bar="bar"
                baz={baz}
            />`,
        },
        {
            code: `
            const foo = <Foo
                onClick={(e) => {
                    // @ts-ignore: inside a JSXAttribute's value
                    e.preventDefault();
                }}
            />`,
        },
    ],
    invalid: [
        {
            code: `
const foo = <Foo
// @ts-expect-error: on JSXAttribute
bar="bar"
baz={baz}
/>`,
            errors: [
                {messageId: "errorString", data: {type: "@ts-expect-error"}},
            ],
            output: `
const foo = <Foo
bar="bar"
baz={baz}
/>`,
        },
        {
            code: `
const foo = <Foo
// @ts-ignore: on JSXAttribute
bar="bar"
baz={baz}
/>`,
            errors: [{messageId: "errorString", data: {type: "@ts-ignore"}}],
            output: `
const foo = <Foo
bar="bar"
baz={baz}
/>`,
        },
        {
            code: `
const foo = <Foo
// @ts-expect-error: on JSXAttribute
bar="bar"
baz={baz}
/>;
const bar = <Bar
// @ts-expect-error: on JSXAttribute
baz={baz}
/>;`,
            errors: [
                {messageId: "errorString", data: {type: "@ts-expect-error"}},
                {messageId: "errorString", data: {type: "@ts-expect-error"}},
            ],
            output: `
const foo = <Foo
bar="bar"
baz={baz}
/>;
const bar = <Bar
baz={baz}
/>;`,
        },
    ],
});
