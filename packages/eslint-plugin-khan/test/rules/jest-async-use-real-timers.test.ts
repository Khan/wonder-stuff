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

const ruleName = "jest-async-use-real-timers";
const rule = rules[ruleName];

ruleTester.run(ruleName, rule, {
    valid: [
        {
            code: `
describe("foo", () => {
    it("doesn't require real timers", () => {});
})`,
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => {
        jest.useRealTimers();
    });
})`,
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async function() {
        jest.useRealTimers();
    });
})`,
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it("requires real timers", async () => {});
})`,
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    describe("bar", () => {
        it("requires real timers", async () => {});
    });
})`,
        },
        {
            code: `
describe("foo", () => {
    describe("bar", () => {
        beforeEach(() => {
            jest.useRealTimers();
        });

        it("requires real timers", async () => {});
    });
})`,
        },
        {
            code: `describe("foo", fn)`,
        },
        {
            code: `describe("foo", () => fn())`,
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", asyncFn);
})`,
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it("requires real timers", async () => asyncFn());
})`,
        },
    ],
    invalid: [
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => {});
})`,
            errors: [{messageId: "errorString"}],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async function() {});
})`,
            errors: [{messageId: "errorString"}],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {});

    it("requires real timers", async () => {});
})`,
            errors: [{messageId: "errorString"}],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {});

    describe("bar", () => {
        it("requires real timers", async () => {});
    });
})`,
            errors: [{messageId: "errorString"}],
        },
        {
            code: `
describe("foo", () => {
    describe("bar", () => {
        beforeEach(() => {});

        it("requires real timers", async () => {});
    });
})`,
            errors: [{messageId: "errorString"}],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => asyncFn());
})`,
            errors: [{messageId: "errorString"}],
        },
    ],
});
