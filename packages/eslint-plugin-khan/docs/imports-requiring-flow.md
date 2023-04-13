# Specify imports that require flow (imports-requiring-flow)

We'd like to require the use of flow with certain modules so that we can
rely on flow to catch issues when refactoring those modules.  This rule
requires that any files importing one of the specified modules be using
flow as indicated by a `// @flow` comment in the file.

This rule also works with directories, so that any modules under that directory
or its subdirectories are required to be using flow types.

Notes:
- All paths in `modules` that aren't npm packages (i.e. are directories or files
  within your codebase) are considered to be relative to `rootDir`.
- `rootDir` is required and should usually be set to `__dirname`.  This
  requires the the configuration of `@khanacademy/imports-requiring-flow` to be
  done in a `.js` file.

## Rule Details

Give the following rule config:

```js
"@khanacademy/imports-requiring-flow": [
    "error", {
        rootDir: __dirname,
        modules: ["foo", "src/bar.js"],
    },
]
```

The following are considered warnings:

```js
import foo from "foo";
```

```js
import foo from "foo/bar";
```

```js
import bar from "./bar";
```

```js
const foo = require("foo");
```

```js
const foo = require("foo/bar");
```

```js
const bar = require("./bar.js");
```

The following are not considered warnings:

```js
// @flow
import foo from "foo";
```

```js
// @flow
import foo from "foo/bar";
```

```js
// @flow
import bar from "./bar";
```

```js
// @flow
const foo = require("foo");
```

```js
// @flow
const foo = require("foo/bar");
```

```js
// @flow
const bar = require("./bar.js");
```

```js
import baz from "./baz.js";
```

```js
const qux = require("qux");
```
