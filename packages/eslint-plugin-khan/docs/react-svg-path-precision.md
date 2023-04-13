# Disallow SVG paths with too many decimal places (react-svg-path-precision)

SVG paths exported form asset creation tools often use too many decimal places
than are necessary especially for content where the viewbox is the same size
as the SVG element.

This rule can detect and fix paths with too many decimal places.  The rule
defaults to two decimal places of precision.  This can be changed by passing
an object, e.g. `{precision: 3}`, as an option in your eslint configuration.

## Rule Details

The following are considered warnings:

```js
<path d="M1.234,0.456L-0.987,42Z"/>
            ^^^   ^^^    ^^^
```

The following are not considered warnings:

```js
<path d="M1.23,0.45L-0.98,42Z"/>
```
