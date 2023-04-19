/**
 * A plugin to create translated versions of Webpack builds. After Webpack compiles
 * all the JS bundles, this plugin goes through all the generated assets and
 * does the following for each locale we want to build and for each file in
 * the emitted assets:
 *
 * - Downloads the translated string JSON files from GCS.
 * - Goes through each asset and transates its contents into each locale that
 *   we support.
 * - Updates any runtime files to ensure that the correct hashes are used in
 *   the filenames.
 * - Updates the manifest files for those locales to point to the right files.
 *
 * To use this plugin, pass it into the `plugins` array of your Webpack config:
 *
 *      plugins: [...others, new I18nPlugin({locales: ["en", "es"]})]
 *
 */
import path from "path";
// @ts-expect-error [FEI-5011] - TS7016 - Could not find a declaration file for module 'async'. '/Users/kevinbarabash/khan/wonder-stuff/node_modules/async/dist/async.js' implicitly has an 'any' type.
import {eachLimit} from "async";

import * as I18nUtils from "../utils/i18n-utils";
import {
    hashFileContents,
    extractHashFromFileName,
    localizeFile,
} from "../utils/localize-file";
import {getEmojiForLocale} from "../utils/emoji-for-locale";

import type {TranslatedLocaleStrings} from "../utils/i18n-utils";

/**
 * Add a new asset to the Webpack compilation assets.
 *
 * @param {Assets} assets the compilation assets object from Webpack
 * @param {string} relFilePath a file path relative to the Webpack output
 *   directory.
 */
const addAsset = (assets: Assets, relFilePath: string, data: string) => {
    assets[relFilePath] = {
        source() {
            return data;
        },
        size() {
            return data.length;
        },
    };
};

export type TranslatedStrings = {
    [locale: string]: TranslatedLocaleStrings;
};

type Options = {
    /**
     * The locales to build. Should be a list of strings like "pt", "es", etc.
     * Be sure to not include "en" in this list, as that is the default locale.
     */
    locales: Array<string>;
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
    getI18nStrings: (locale: string) => Promise<TranslatedLocaleStrings>;
    /**
     * Provide a partial path to the Webpack output directory that includes
     * the locale. Defaults to: "/<locale>/".
     */
    getLocalePath?: (locale: string) => string;
    /**
     * Indicate if an asset should have the hashes and URLs inside of it
     * updated to use the new locale. Defaults to handling any bundle named
     * "runtime" (you will want to do this for any bundle that contains
     * the runtime or has references to other JS files)
     */
    shouldLocalizeAsset?: (assetName: string) => boolean;
    /**
     * Determine if a file should be processed, meaning if it should be copied
     * over to the new locale directory. Defaults to all files.
     */
    shouldProcessAsset?: (assetName: string) => boolean;
    /**
     * Determine if a manifest file, for a given locale should be modified to
     * point to the new JS files or assets. Defaults to processing all '.html'
     * files.
     */
    shouldLocalizeManifest?: (assetName: string, locale: string) => boolean;
    /**
     * Should the plugin log any messages to the console? Defaults to true.
     */
    silent?: boolean;
    /**
     * Should the plugin log any timing information? None is logged by default.
     */
    timing?: {
        start: (arg1: string) => void;
        end: (arg1: string) => void;
    };
};

type InternalOptions = {
    locales: Array<string>;
    silent?: boolean;
    timing?: {
        start: (arg1: string) => void;
        end: (arg1: string) => void;
    };
    getI18nStrings: (locale: string) => Promise<TranslatedLocaleStrings>;
    getLocalePath: (locale: string) => string;
    shouldLocalizeAsset: (assetName: string) => boolean;
    shouldProcessAsset: (assetName: string) => boolean;
    shouldLocalizeManifest: (assetName: string, locale: string) => boolean;
};

type LocaleHashMap = {
    [oldHash: string]: string;
};
type HashMaps = {
    [locale: string]: LocaleHashMap;
};

type Asset = {
    source: () => string;
    size: () => number;
};

export type Assets = {
    [assetName: string]: Asset;
};

// eslint-disable-next-line import/no-default-export
export default class I18nPlugin {
    options: InternalOptions;

    constructor(options: Options) {
        if (!options) {
            throw new Error("I18nPlugin requires options");
        }

        if (!options.locales) {
            throw new Error("Must provide locales to localize to");
        }

        if (!options.getI18nStrings) {
            throw new Error(
                "Must provide a function to get the strings to localize",
            );
        }

        this.options = {
            getLocalePath: (locale) => `/${locale}/`,
            shouldLocalizeAsset: (assetName) =>
                assetName.startsWith("runtime."),
            shouldProcessAsset: () => true,
            shouldLocalizeManifest: (assetName) => assetName.endsWith(".html"),
            ...options,
            // Filter out English locale if it exists
            locales: options.locales.filter((locale) => locale !== "en"),
        };

        if (this.options.locales.length === 0) {
            this.log("I18nPlugin: No locales to localize to.");
        }
    }

    /* istanbul ignore next */
    apply(compiler: any) {
        // @ts-expect-error [FEI-5011] - TS7006 - Parameter 'options' implicitly has an 'any' type. | TS7006 - Parameter 'callback' implicitly has an 'any' type.
        compiler.hooks.emit.tapAsync("I18nPlugin", (options, callback) =>
            this.onEmit(options, callback),
        );
    }

    /**
     * Log out something to the console, if we're not silent.
     *
     * @param  {...any} args the args to log out to the console
     */
    log(...args: Array<any>) {
        const {silent} = this.options;
        if (silent === false || silent == null) {
            // eslint-disable-next-line no-console
            console.log(...args);
        }
    }

    /**
     * Get all the translated strings from Crowdin. The results are stored and
     * returned in a map of locale to string map.
     *
     * @param {Array<string>} locales the locales to get the strings for
     * @returns {Object<string, Object<string, Object>>} a mapping of locale to
     *                                                   msgId to string data
     */
    async getTranslatedStrings(
        locales: Array<string>,
    ): Promise<TranslatedStrings> {
        const {timing, getI18nStrings} = this.options;
        const translatedStrings: TranslatedStrings = {};

        const timingName = `I18nPlugin/Translation/get-strings`;

        if (timing) {
            timing.start(timingName);
        }

        // Download the strings for each locale in parallel
        // @ts-expect-error [FEI-5011] - TS7006 - Parameter 'locale' implicitly has an 'any' type.
        await eachLimit(locales, 4, async (locale) => {
            this.log(
                `Retreiving strings for ${locale} ${getEmojiForLocale(locale)}`,
            );

            translatedStrings[locale] = await getI18nStrings(locale);
        });

        if (timing) {
            timing.end(timingName);
        }

        return translatedStrings;
    }

    /**
     * Go through all of the JS assets and insert translated strings for every
     * locale that we're currently translating into.
     *
     * @param {{assets: Assets, translatedStrings: TranslatedStrings}} options
     * @returns {Object<string, string>} a map of old file hashes to new hashes
     */
    translateAssets({
        assets,
        translatedStrings,
        localizeRuntimeFiles,
        hashMap,
    }: {
        assets: Assets;
        translatedStrings: TranslatedStrings;
        localizeRuntimeFiles: boolean;
        hashMap?: HashMaps;
    }): HashMaps {
        const {
            locales,
            timing,
            getLocalePath,
            shouldProcessAsset,
            shouldLocalizeAsset,
        } = this.options;

        const assetPaths = Object.keys(assets).filter(shouldProcessAsset);
        const timingName = `I18nPlugin/Translation/translation`;

        if (timing) {
            timing.start(timingName);
        }

        if (localizeRuntimeFiles) {
            this.log(`Updating JS runtime files...`);
        } else {
            this.log(`Translating JS files...`);
        }

        // Initialize the map of old hashes to new hashes for each locale
        if (!hashMap) {
            hashMap = {} as HashMaps;

            for (const locale of locales) {
                hashMap[locale] = {};
            }
        }

        for (const assetPath of assetPaths) {
            const oldSource = assets[assetPath].source();

            // We only translate JS files
            if (!assetPath.endsWith(".js")) {
                // If it's not a JS file, we don't need to translate it, but
                // we do need to copy it into its new location
                for (const locale of locales) {
                    const translatedAssetPath = path.join(
                        "..",
                        locale,
                        assetPath,
                    );
                    addAsset(assets, translatedAssetPath, oldSource);
                }
                continue;
            }

            const shouldBeLocalized = shouldLocalizeAsset(assetPath);

            // If we're not localizing runtime files yet, or if we are and this
            // is not a runtime file, we can skip this file.
            if (
                (shouldBeLocalized && !localizeRuntimeFiles) ||
                (!shouldBeLocalized && localizeRuntimeFiles)
            ) {
                continue;
            }

            // Extract the old hash out of the existing JS filename, we'll be
            // potentially replacing this later.
            const oldHash = extractHashFromFileName(assetPath);
            if (!oldHash) {
                throw new Error(`${assetPath} is missing hash in filename.`);
            }

            // We pre-parse the strings so that we can re-use the strings
            // for each locale, this helps to improve performance.
            const strings = I18nUtils.getI18nStringsFromString(oldSource);

            // Go through each locale that we want to translate into.
            for (const locale of locales) {
                let translatedSource = I18nUtils.translateString(
                    oldSource,
                    translatedStrings[locale],
                    strings,
                );

                // The output location is relative to /prod/en/, so we need
                // to build a path that points to the correct location.
                let translatedAssetPath = path.join("..", locale, assetPath);

                // We optionally localize any files which refer to other
                // JS files, making sure they point to the right location
                if (shouldBeLocalized) {
                    translatedSource = localizeFile({
                        content: translatedSource,
                        oldHash,
                        hashMap: hashMap[locale],
                        locale,
                        getLocalePath,
                    });
                }

                // If the contents of the file have been translated, then we
                // need to recompute the hash based on the new contents. This
                // also involves updating the hash in the filename.
                if (translatedSource !== oldSource) {
                    const newHash = hashFileContents(translatedSource);
                    hashMap[locale][oldHash] = newHash;
                    translatedAssetPath = translatedAssetPath.replace(
                        oldHash,
                        newHash,
                    );
                }

                // Tell Webpack to write out the translated file
                addAsset(assets, translatedAssetPath, translatedSource);
            }
        }

        if (timing) {
            timing.end(timingName);
        }

        return hashMap;
    }

    /**
     * Update manifest files so that they point to the correct location of
     * the translated files.
     *
     * @param {{assets: Assets, hashMap: HashMaps}} options
     */
    localizeManifests({assets, hashMap}: {assets: Assets; hashMap: HashMaps}) {
        const {locales, timing, shouldLocalizeManifest, getLocalePath} =
            this.options;

        const timingName = `I18nPlugin/Translation/localize-manifests`;

        if (timing) {
            timing.start(timingName);
        }

        for (const locale of locales) {
            this.log(
                `Updating manifests for ${locale} ${getEmojiForLocale(locale)}`,
            );

            // We then localize any manifest or HTML files, as well
            const files = Object.keys(assets).filter((assetName) =>
                shouldLocalizeManifest(assetName, locale),
            );
            for (const fileName of files) {
                const localizedSource = localizeFile({
                    content: assets[fileName].source(),
                    oldHash: null,
                    hashMap: hashMap[locale],
                    locale,
                    getLocalePath,
                });

                // Rename the file to the localized version
                addAsset(assets, fileName, localizedSource);
            }
        }

        if (timing) {
            timing.end(timingName);
        }
    }

    /**
     * Logic to run when emitting the files. This will get the translated
     * strings, translate the assets, and update the manifest files.
     *
     * @param {Object} options compilation options from Webpack
     * @param {Function} callback callback function to call when done
     * @returns void
     */
    async onEmit(
        {
            assets,
        }: {
            assets: Assets;
        },
        callback: () => void,
    ): Promise<void> {
        const {locales} = this.options;

        // Don't do anything if we're not building for any locales
        if (locales.length === 0) {
            callback();
            return;
        }

        // Get the translated strings for the locales from Crowdin
        const translatedStrings = await this.getTranslatedStrings(locales);

        // Translate the assets, returning a map of old file hashes to new hashes
        const hashMap = this.translateAssets({
            assets,
            translatedStrings,
            localizeRuntimeFiles: false,
        });

        // We go back through and translate the runtime files, which contain
        // references to other JS files.
        this.translateAssets({
            assets,
            translatedStrings,
            localizeRuntimeFiles: true,
            hashMap,
        });

        // We wrap up by localizing any files that refer to other JS files,
        // such as manifests and HTML pages.
        this.localizeManifests({assets, hashMap});

        callback();
    }
}
