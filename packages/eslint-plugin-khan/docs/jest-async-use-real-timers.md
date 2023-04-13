# Require async tests to call jest.useRealTimers() (jest-async-use-real-timers)

By default jest uses real timers.  Some projects opt to use fake timers
as a default in order to speed up test execution.  This requires any
async tests to explicitly call `jest.useRealTimers()`.  This rule can
be used in this situation to help developers remember to make this call.

## Rule Details

The following are considered warnings:

```js
describe("foo", () => {
    it("requires real timers", async () => {});
})
```

```js
describe("foo", () => {
    it("requires real timers", async function() {});
})
```

The following are not considered warnings:

```js
describe("foo", () => {
    it("doesn't require real timers", () => {});
})
```

```js
describe("foo", () => {
    it("requires real timers", async () => {
        jest.useRealTimers();
    });
})
```

```js
describe("foo", () => {
    it("requires real timers", async function() {
        jest.useRealTimers();
    });
})
```

```js
describe("foo", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    it("requires real timers", async () => {});
})
```
