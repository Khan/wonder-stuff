# eslint-config-khan

Shared Khan Academy eslint configuration.

## Quick Start

- `(yarn|pnpm) add --save-dev @khanacademy/eslint-config`
- Update your .eslintrc.js file to:
  - extend `"@khanacademy"`
  - include settings for `"import/resolver"`
- For accessibility linting rules, extend `@khanacademy/eslint-config/a11y`

For monorepos the `"import/resolver"` settings will look like this:

```
    settings: {
        "import/resolver": {
            typescript: {
                project: [
                    "packages/*/tsconfig.json",
                    "packages/tsconfig-shared.json",
                ],
            },
            node: {
                project: [
                    "packages/*/tsconfig.json",
                    "packages/tsconfig-shared.json",
                ],
            },
        },
    },
```

For regular repos, the settings will look like this:

```
    settings: {
        "import/resolver": {
            typescript: {
                project: "tsconfig.json",
            },
            node: {
                project: "tsconfig.json",
            },
        },
    },
```
