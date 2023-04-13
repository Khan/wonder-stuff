const path = require("path");

const {rules} = require("../lib/index.js");
const RuleTester = require("eslint").RuleTester;

const parserOptions = {
    parser: "babel-eslint",
};

const ruleTester = new RuleTester(parserOptions);
const rule = rules["jest-await-async-matchers"];

ruleTester.run("jest-await-async-matchers", rule, {
    valid: [
        {
            code: `async () => await expect(promise).resolves.toBe(true);`,
            options: [],
        },
        {
            code: `async () => await expect(promise).resolves.not.toBe(true);`,
            options: [],
        },
        {
            code: `async () => await expect(promise).rejects.toThrow("foo");`,
            options: [],
        },
        {
            code: `async () => await expect(promise).rejects.not.toThrow("foo");`,
            options: [],
        },
        {
            code: `async () => await expect(promise).toResolve();`,
            options: [],
        },
        {
            code: `async () => await expect(promise).not.toResolve();`,
            options: [],
        },
        {
            code: `async () => await expect(promise).toReject();`,
            options: [],
        },
        {
            code: `async () => await expect(promise).not.toReject();`,
            options: [],
        },
        {
            code: `async () => await expect(callback).toHaveMarkedConversion();`,
            options: [
                {
                    matchers: ["toHaveMarkedConversion"],
                },
            ],
        },
        // Don't report other matchers
        {
            code: `expect(callback).toBe(true);`,
            options: [],
        },
    ],
    invalid: [
        {
            code: `expect(promise).resolves.toBe(true);`,
            options: [],
            errors: ["Assertions using `resolves` should be awaited."],
            output: "await expect(promise).resolves.toBe(true);",
        },
        {
            code: `expect(promise).resolves.not.toBe(true);`,
            options: [],
            errors: ["Assertions using `resolves` should be awaited."],
            output: "await expect(promise).resolves.not.toBe(true);",
        },
        {
            code: `expect(promise).rejects.toThrow(new Error("foo"));`,
            options: [],
            errors: ["Assertions using `rejects` should be awaited."],
            output: 'await expect(promise).rejects.toThrow(new Error("foo"));',
        },
        {
            code: `expect(promise).rejects.not.toThrow(new Error("foo"));`,
            options: [],
            errors: ["Assertions using `rejects` should be awaited."],
            output:
                'await expect(promise).rejects.not.toThrow(new Error("foo"));',
        },
        {
            code: `expect(promise).resolves.not.toBe(true);`,
            options: [],
            errors: ["Assertions using `resolves` should be awaited."],
            output: "await expect(promise).resolves.not.toBe(true);",
        },
        {
            code: `expect(promise).toResolve();`,
            options: [],
            errors: ["Assertions using `toResolve` should be awaited."],
            output: "await expect(promise).toResolve();",
        },
        {
            code: `expect(promise).toReject();`,
            options: [],
            errors: ["Assertions using `toReject` should be awaited."],
            output: "await expect(promise).toReject();",
        },
        {
            code: `expect(promise).not.toResolve();`,
            options: [],
            errors: ["Assertions using `toResolve` should be awaited."],
            output: "await expect(promise).not.toResolve();",
        },
        {
            code: `expect(promise).not.toReject();`,
            options: [],
            errors: ["Assertions using `toReject` should be awaited."],
            output: "await expect(promise).not.toReject();",
        },
        // Report custom matchers if listed in the rule options
        {
            code: `expect(callback).toHaveMarkedConversion();`,
            options: [
                {
                    matchers: ["toHaveMarkedConversion"],
                },
            ],
            errors: [
                "Assertions using `toHaveMarkedConversion` should be awaited.",
            ],
            output: "await expect(callback).toHaveMarkedConversion();",
        },
    ],
});
