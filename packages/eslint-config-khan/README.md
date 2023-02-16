# eslint-config-khan

Shared Khan Academy eslint configuration.

## Quick Start

- `yarn add @khanacademy/eslint-config`
- Update your .eslintrc.js file to:
  - extend `"@khanacademy"`
  - include settings for `"import/resolver"`

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

For regulard repos, the settings will look like this:

```
For monorepos the `"import/resolver"` settings will look like this:

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
