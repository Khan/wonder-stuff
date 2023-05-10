import rule from "../../src/rules/jest-await-async-matchers";
import {RuleTester} from "../RuleTester";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
});

ruleTester.run("jest-await-async-matchers", rule, {
    valid: [
        {
            code: `async () => await expect(promise).resolves.toBe(true);`,
        },
        {
            code: `async () => await expect(promise).resolves.not.toBe(true);`,
        },
        {
            code: `async () => await expect(promise).rejects.toThrow("foo");`,
        },
        {
            code: `async () => await expect(promise).rejects.not.toThrow("foo");`,
        },
        {
            code: `async () => await expect(promise).toResolve();`,
        },
        {
            code: `async () => await expect(promise).not.toResolve();`,
        },
        {
            code: `async () => await expect(promise).toReject();`,
        },
        {
            code: `async () => await expect(promise).not.toReject();`,
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
        },
    ],
    invalid: [
        {
            code: `expect(promise).resolves.toBe(true);`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["resolves"]}},
            ],
            output: "await expect(promise).resolves.toBe(true);",
        },
        {
            code: `expect(promise).resolves.not.toBe(true);`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["resolves"]}},
            ],
            output: "await expect(promise).resolves.not.toBe(true);",
        },
        {
            code: `expect(promise).rejects.toThrow(new Error("foo"));`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["rejects"]}},
            ],
            output: 'await expect(promise).rejects.toThrow(new Error("foo"));',
        },
        {
            code: `expect(promise).rejects.not.toThrow(new Error("foo"));`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["rejects"]}},
            ],
            output: 'await expect(promise).rejects.not.toThrow(new Error("foo"));',
        },
        {
            code: `expect(promise).resolves.not.toBe(true);`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["resolves"]}},
            ],
            output: "await expect(promise).resolves.not.toBe(true);",
        },
        {
            code: `expect(promise).toResolve();`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["toResolve"]}},
            ],
            output: "await expect(promise).toResolve();",
        },
        {
            code: `expect(promise).toReject();`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["toReject"]}},
            ],
            output: "await expect(promise).toReject();",
        },
        {
            code: `expect(promise).not.toResolve();`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["toResolve"]}},
            ],
            output: "await expect(promise).not.toResolve();",
        },
        {
            code: `expect(promise).not.toReject();`,

            errors: [
                {messageId: "asyncMatchers", data: {matchers: ["toReject"]}},
            ],
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
                {
                    messageId: "asyncMatchers",
                    data: {matchers: ["toHaveMarkedConversion"]},
                },
            ],
            output: "await expect(callback).toHaveMarkedConversion();",
        },
    ],
});
