const path = require("path");

const {rules} = require("../lib/index.js");
const RuleTester = require("eslint").RuleTester;

const parserOptions = {
    parser: "babel-eslint",
};

const ruleTester = new RuleTester(parserOptions);
const rule = rules["jest-async-use-real-timers"];

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
