# wonder-stuff-i18n

This package provides tools for handling internationalization of a JavaScript
code base. This should be used in conjunction with `@khanacademy/wonder-blocks-i18n`
which provides the client-side logic for handling internationalization.

The following things are all exported from `@khanacademy/wonder-stuff-i18n`:

## Webpack v4 Plugin

Usage:

```
import {I18nPlugin} from "@khanacademy/wonder-stuff-i18n";
...
plugins: [
    new I18nPlugin({
        locales: ["es", "pt", "zh-hant"],
        getI18nStrings: (locale) => require(`./locales/${locale}.json`),
    }),
],
```

This plugin assumes that you're generating JavaScript bundles, in English, and
outputting those bundles to a directory and file like:
`../en/bundle.abcdefabcdef01234567.js`. The directory should have the locale
name in it and the bundles should have a 20-character hex hash on the end.

The plugin will read in the translated strings (via what you provide using the
`getI18nStrings`) for each non-English locale that you provide in `locales`.
It will then produce copies of all the assets that Webpack built into that
locales directory. For example: `en/foo.woff2` will produce: `es/foo.woff2` and
`pt/foo.woff2` if those two locales are specified.

Additionally, all JavaScript files will be modified so that any English strings
that've been marked up using the methods from `@khanacademy/wonder-blocks-i18n`
will have their English text replaced with the text from that locale. A new
content hash will be generated for that file and the filename will be updated.

All runtime JS files will be updated so that they're pointing to the updated
copies of the translated JS files. By default this will include a bundle named
"runtime" (but this can be configured).

Finally, all manifest files (such as `.html` files referencing JS files) will
be updated to point to the translated JS files.

The I18nPlugin has the following configuration options:

```
/**
 * The locales to build. Should be a list of strings like "pt", "es", etc.
 * Be sure to not include "en" in this list, as that is the default locale.
 */
locales: Array<string>,

/**
 * Get localized strings for a particular locale.
 *
 * Should return a promise that points to a JSON object in the format of:
 *
 * {
 *     "english msgid": "translated msgid in locale",
 *     "another english msgid": "another translated msgid in locale",
 *     "plural english msgid": {
 *         "lang": "es",
 *         "messages": [
 *             "translated singular msgid in locale",
 *             "translated plural msgid in locale"
 *         ]
 *     },
 *     ...
 * }
 */
getI18nStrings: (locale: string) => Promise<TranslatedLocaleStrings>,

/**
 * Provide a partial path to the Webpack output directory that includes
 * the locale. Defaults to: "/<locale>/".
 */
getLocalePath?: (locale: string) => string,

/**
 * Indicate if an asset should have the hashes and URLs inside of it
 * updated to use the new locale. Defaults to handling any bundle named
 * "runtime" (you will want to do this for any bundle that contains
 * the runtime or has references to other JS files)
 */
shouldLocalizeAsset?: (assetName: string) => boolean,

/**
 * Determine if a file should be processed, meaning if it should be copied
 * over to the new locale directory. Defaults to all files.
 */
shouldProcessAsset?: (assetName: string) => boolean,

/**
 * Determine if a manifest file, for a given locale should be modified to
 * point to the new JS files or assets. Defaults to processing all '.html'
 * files.
 */
shouldLocalizeManifest?: (assetName: string, locale: string) => boolean,

/**
 * Should the plugin log any messages to the console? Defaults to true.
 */
silent?: boolean,

/**
 * Should the plugin log any timing information? None is logged by default.
 */
timing?: {
    start: (string) => void,
    end: (string) => void,
    ...
},
```

NOTE: This plugin may work in Webpack v5, as well, but hasn't been tested yet.

## Tools

### `all-i18n-strings`

Locates all translateable strings from the specified files and outputs them
to STDOUT. This will automatically read any `.i18nignore` file in your project
and won't extract strings from any files matches those specified globs.

How to use:

```
all-i18n-strings my-file.js
all-i18n-strings "**/*.{js,jsx}"
```

Output:

```
Test String
Singular %(num)s (plural: Plural %(num)s)
```

### `gen-potfile`

Generates a POT file that holds all translatable strings from the specified
files and outputs them to STDOUT. This will automatically read any
`.i18nignore` file in your project and won't extract strings from any files
matches those specified globs.

How to use:

```
gen-potfile my-file.js
gen-potfile "**/*.{js,jsx}"
```

Output:

```
msgid ""
msgstr ""

#: foo.js:1
msgid "Test String"
msgstr ""

#: foo.js:3
#, python-format
msgid "Singular %(num)s"
msgid_plural "Plural %(num)s"
msgstr[0] ""
msgstr[1] ""
```

## Utility Methods

## `extractStrings(string)`

Extract all i18n strings (and comments) from a file. This method yields objects
with the relevant details, namely:

```
// The line number of the string in the original file.
linePos: number,
// The starting position of the string in the original file.
startOffset: number,
// The ending position of the string in the original file.
endOffset: number,
// The type of string, such as "_", "$_", or "ngettext".
type: string,
// The strings found (will be one for singular, two for plural)
msgids: Array<string>,
// The comments (prefixed with I18N:) associated with the string.
comments: Array<string>,
```

## `getI18nStringsFromString`

Works similarly to `extractStrings(string)` but returns the results as a
reversed array, which makes it easier to feed into a method like
`translateString`.

## `translateString`

TODO

## `getFilesToExtractFrom`

TODO

## `getIgnoreGlobs`

TODO

## `getPOTFileStringFromFiles`

TODO

## `getEmojiForLocale(locale: string)`

Returns an Emoji that best matches the specified locale.