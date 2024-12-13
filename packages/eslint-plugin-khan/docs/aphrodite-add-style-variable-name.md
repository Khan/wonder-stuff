# Naming convention for addStyle variable (aphrodite-add-style-variable-name)

The variable name should match the tag name passed into `addStyle` and follow the format: `StyledTag`.

This is useful so that Aphrodite styled elements can be mapped to HTML elements for static code analysis. For example, if the `addStyle` variables are consistently named, we are able to provide [custom component mapping](https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#component-mapping) to `eslint-plugin-jsx-a11y` so that it can identify linting issues based on the underlying HTML tag.

This naming convention only applies to string arguments for HTML tags. It is not enforced when a component is used as the addStyle argument.

## Rule Details

The following are considered warnings:

```ts
const div = addStyle("div");
```

```ts
const foo = addStyle("span");
```

```ts
const container = addStyle("div");
```

The following are not considered warnings:

```ts
const StyledDiv = addStyle("div");
```

```ts
const StyledSpan = addStyle("span");
```

```ts
const StyledImg = addStyle("img");
```

```ts
// Any variable name can be used when addStyle is used with a component
const LinkWithStyle = addStyle(Link);
const Foo = addStyle(Bar);
```
