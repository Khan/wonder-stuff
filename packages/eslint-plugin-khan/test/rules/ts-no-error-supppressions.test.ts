import {rules} from "../../src/index";
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
        },
        {
            code: `
            const foo = <Foo
                // @ts-ignore: on JSXAttribute
                bar="bar"
                baz={baz}
            />`,
            errors: [{messageId: "errorString", data: {type: "@ts-ignore"}}],
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
        },
    ],
});
