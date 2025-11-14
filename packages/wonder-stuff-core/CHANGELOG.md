# @khanacademy/wonder-stuff-core

## 2.0.1

### Patch Changes

-   71b60fb: Re-publish with Trusted Publishing (no functional changes from previous release)

## 2.0.0

### Major Changes

-   a27f83f5: Update to TypeScript 5.9.x and other dependency changes
-   6277a04b: Minimum node set to 20

### Patch Changes

-   8972b362: Re-publishing to enable Trusted Publishing
-   eee37380: Re-publish with Trusted Publishing (no functional changes in this release)
-   6277a04b: Added `Runtime` type

## 1.5.5

### Patch Changes

-   82ec7078: Migrate packages to use pnpm internally

## 1.5.4

### Patch Changes

-   a026cee: Stop packaging some files that we don't need to package

## 1.5.3

### Patch Changes

-   4fb7745: Don't include TypeScript config and buildinfo in packages

## 1.5.2

### Patch Changes

-   23a8585: Update comments to no longer reference Flow

## 1.5.1

### Patch Changes

-   804b41a: Make sure isTruthy and isNonNullable get exported

## 1.5.0

### Minor Changes

-   f3127aa: Add isTruthy and isNonNullable type predicates
-   f3127aa: Add UnreachableCaseError for use in exhaustive switch-case statements

## 1.4.2

### Patch Changes

-   b28725a: Fix the typing for the `key` function

## 1.4.1

### Patch Changes

-   0299cc9: Fix some errors in the generated flow types

## 1.4.0

### Minor Changes

-   07488a4: Modified browser builds to have their own folder so we can easily support dynamic import usage

### Patch Changes

-   bd77edc: Added `Mutable` type

## 1.3.0

### Minor Changes

-   6897505: Added secret-related types and utility for turning a string into a secret

## 1.2.2

### Patch Changes

-   298b871: Update package.json files to use 'types' instead of 'source'

## 1.2.1

### Patch Changes

-   cfadf15: Update generate flow types to use 'extends' instead of 'mixins'

## 1.2.0

### Minor Changes

-   74dc263: Export 'entries', 'keys', and 'values' wrappers

## 1.1.0

### Minor Changes

-   4538fa2: Migrate to TypeScript
-   5c50724: Re-add entries, keys, and values wrappers

### Patch Changes

-   035e345: Generate Flow types from TypeScript types

## 1.0.2

### Patch Changes

-   ddd526c: Fix typing of isolateModules

## 1.0.1

### Patch Changes

-   753b193: Broaden typing for keys/values/entries methods

## 1.0.0

### Major Changes

-   99abd47: Drop Node 12, target Node 16

### Patch Changes

-   1ec0968: Update types for `keys` so that it works with a wider variety of object shapes

## 0.2.0

### Minor Changes

-   4a2bca5: Add `entries` method as strongly-typed alternative to `Object.entries`
-   0a7b461: Add `keys` method as strongly-typed alternative to `Object.keys`
-   e7e3b5f: Add `values` method as strongly-typed alternative to `Object.values`

## 0.1.3

### Patch Changes

-   9d06268: - 🆕 Added `Errors.InvalidUse` error kind to Core and removed from Testing
