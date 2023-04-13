# Require the use of enzyme matchers when possible (jest-enzyme-matchers)

[jest-enzyme](https://github.com/FormidableLabs/enzyme-matchers/tree/master/packages/jest-enzyme#readme)
provides a number of matchers that useful when writing enzyme tests.  Using these
matchers providers better error messages when there are test failures.  This rule
supporters auto-fixing.

## Rule Details

```js
// Invalid
expect(wrapper.first().prop("foo")).toEqual("bar");

// Valid
expect(wrapper).toHaveProp("foo", "bar");
```

```js
// Invalid
expect(wrapper.first().state("foo")).toEqual("bar");

// Valid
expect(wrapper).toHaveState("foo", "bar");
```

```js
// Invalid
expect(wrapper.find(".foo")).toHaveLength(2);

// Valid
expect(wrapper).toContainMatchingElements(2, ".foo");
```

```js
// Invalid
expect(wrapper.find(".foo").text()).toEqual("bar");

// Valid
expect(wrapper.find(".foo")).toHaveText("bar");
```

```js
// Invalid
expect(wrapper.find(".foo").html()).toEqual("<p>bar</p>");

// Valid
expect(wrapper.find(".foo")).toHaveHTML("<p>bar</p>");
```

```js
// Invalid
expect(wrapper.find(".foo").exists()).toBeTrue();

// Valid
expect(wrapper.find(".foo")).toExist();
```

```js
// Invalid
expect(wrapper.find(".foo").exists()).toBeFalse();

// Valid
expect(wrapper.find(".foo")).not.toExist();
```
