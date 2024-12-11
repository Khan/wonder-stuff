# eslint-plugin-khan

[![Build Status](https://travis-ci.org/Khan/eslint-plugin-khan.svg?branch=master)](https://travis-ci.org/Khan/eslint-plugin-khan)

eslint plugin with our set of custom rules for various things

## Rules

- [khan/jest-async-use-real-timers](docs/jest-async-use-real-timers.md)
- [khan/jest-enzyme-matchers](docs/jest-enzyme-matchers.md)
- [khan/react-no-method-jsx-attribute](docs/react-no-method-jsx-attribute.md)
- [khan/react-no-subscriptions-before-mount](docs/react-no-subscriptions-before-mount.md)
- [khan/react-svg-path-precision](docs/react-svg-path-precision.md)
- [khan/sync-tag](docs/sync-tag.md)
- [khan/aphrodite-add-style-variable-name](docs/aphrodite-add-style-variable-name.md)

## Creating a new lint rule

Here are some helpful resources for setting up a new lint rule:

- [TypeScript Eslint custom rules](https://typescript-eslint.io/developers/custom-rules/)
- [AST Explorer](https://astexplorer.net/): A tool for showing what the abstract syntax tree (AST) looks like based on code
- [ESTree Spec](https://github.com/estree/estree/tree/master): The spec for learning more about the AST node types
