# Prevent the use of @ts-expect-error _et al_ on JSX attributes

Using these TypeScript error suppressions on JSX attributes causes TS to opt out of
type checking for all props/attributes on JSX elements, even those without an error
suppression comment.

## Rule Details

The following are considered warnings:

```js
const MyComponent = () => {
    return <Foo
        // @ts-expect-error
        onBar={() => {}}
    />;
}
```

```js
const MyComponent = () => {
    return <Foo
        // @ts-ignore
        onBar={() => {}}
    />;
}
```

The following are **not** considered warnings:

```js
const MyComponent = () => {
    // @ts-expect-error
    return <Foo
        onBar={() => {}}
    />;
}
```

```js
const MyComponent = () => {
    return <Foo
        onBar={(e) => {
            // @ts-ignore
            e.preventDefault();
        }}
    />;
}
```
