# Require async matchers to be awaited (jest-await-async-matchers)

Matchers that contain asynchronous computations must be awaited to operate correctly.
If they aren't, a test could pass even if it should fail.  This is because the
matcher hasn't finished running.  This rule can help ensure that we're `await`-ing
those matchers that need it.  By default the following matchers must be `await`-ed
with this rule: `.resolves.`, `.rejects.`, `.toResolve()`, and `.toReject()`.  Custom
matchers can be added to this list using the `matchers` option.

## Rule Details

Give the following rule config:

```js
"@khanacademy/jest": [
    "error", {
        matchers: ["toHaveMarkedConversion"],
    },
]
```

The following are considered warnings:

```js
async () => {
    expect(callback).toHaveMarkedConversion();
}
```

```js
async () => {
    expect(callback).not.toHaveMarkedConversion();
}
```

```js
async () => {
    expect(promise).resolves.toBe(true);
}
```

```js
async () => {
    expect(promise).resolves.not.toBe(true);
}
```

```js
async () => {
    expect(promise).rejects.toThrow(new Error("bar"));
}
```

```js
async () => {
    expect(promise).rejects.not.toThrow(new Error("bar"));
}
```

```js
async () => {
    expect(promise).toResolve();
}
```

```js
async () => {
    expect(promise).toReject();
}
```

The following are not considered warnings:

```js
async () => {
    await expect(callback).toHaveMarkedConversion();
}
```

```js
async () => {
    await expect(callback).not.toHaveMarkedConversion();
}
```

```js
async () => {
    await expect(promise).resolves.toBe(true);
}
```

```js
async () => {
    await expect(promise).resolves.not.toBe(true);
}
```

```js
async () => {
    await expect(promise).rejects.toThrow(new Error("bar"));
}
```

```js
async () => {
    await expect(promise).rejects.not.toThrow(new Error("bar"));
}
```

```js
async () => {
    await expect(promise).toResolve();
}
```

```js
async () => {
    await expect(promise).toReject();
}
```
