import * as path from "path";

import rule from "../../src/rules/jest-async-use-real-timers";
import {RuleTester} from "../RuleTester";

const ruleTester = new RuleTester({
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        ecmaFeatures: {},
    },
});

ruleTester.run("jest-real-timers", rule, {
    valid: [
        {
            code: `
describe("foo", () => {
    it("doesn't require real timers", () => {});
})`,
            options: [],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => {
        jest.useRealTimers();
    });
})`,
            options: [],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async function() {
        jest.useRealTimers();
    });
})`,
            options: [],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it("requires real timers", async () => {});
})`,
            options: [],
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
            options: [],
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
            options: [],
        },
        {
            code: `describe("foo", fn)`,
            options: [],
        },
        {
            code: `describe("foo", () => fn())`,
            options: [],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", asyncFn);
})`,
            options: [],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it("requires real timers", async () => asyncFn());
})`,
            options: [],
        },
    ],
    invalid: [
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => {});
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async function() {});
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {});

    it("requires real timers", async () => {});
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
        {
            code: `
describe("foo", () => {
    beforeEach(() => {});

    describe("bar", () => {
        it("requires real timers", async () => {});
    });
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
        {
            code: `
describe("foo", () => {
    describe("bar", () => {
        beforeEach(() => {});

        it("requires real timers", async () => {});
    });
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
        {
            code: `
describe("foo", () => {
    it("requires real timers", async () => asyncFn());
})`,
            options: [],
            errors: ["Async tests require jest.useRealTimers()."],
        },
    ],
});
