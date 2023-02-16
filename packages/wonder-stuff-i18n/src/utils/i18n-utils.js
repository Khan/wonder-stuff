// @flow
import fs from "fs";
import path from "path";

import ancesdir from "ancesdir";

import {extractStrings} from "./extract-i18n";

import type {ExtractedString} from "./extract-i18n";

export type TranslatedLocaleStrings = {
    [msgid: string]: string | {|lang: string, messages: Array<string>|},
};

/**
 *
 * @param {string} ignoreFile The file to read the glob strings from.
 * @returns {Array<string>} a list of glob strings to ignore
 */
export const getIgnoreGlobs = (
    ignoreFile: string = ".i18nignore",
): Array<string> => {
    try {
        // Find the ignore file, if it exists
        // If it doesn't exist then ancesdir throws an exception.
        const ignoreDir = ancesdir(__dirname, ignoreFile);

        const foundIgnoreFile = path.join(ignoreDir, ignoreFile);
        return (
            fs
                .readFileSync(foundIgnoreFile, "utf8")
                .split("\n")
                // Remove comments and trailing whitespace
                .map((line) => line.replace(/\s*#.*$/g, "").trim())
                // Remove empty strings
                .filter((line) => !!line)
        );
    } catch (e) {
        // If the file doesn't exist, then we're not ignoring any files.
        return [];
    }
};

/**
 * Extracts the location of the i18n strings in the given code string.
 *
 * @param {string} textString a string of code to extract strings from
 * @returns {Array<Object>} the strings that were extracted from the given
 *  code string
 */
export const getI18nStringsFromString = (
    textString: string,
): Array<ExtractedString> => {
    const strings = [];

    // Get all the strings that need to be replaced, but in reverse
    // order, so that it's easier to insert them in the right place.
    for (const extractedString of extractStrings(textString)) {
        strings.unshift(extractedString);
    }

    return strings;
};

/**
 * Insert translated strings into a code string, returning the fully translated
 * code string.
 *
 * @param {string} textString the string to translate, containing code.
 * @param {TranslatedLocaleStrings} translatedStrings the translated strings
 * to insert into code string.
 * @param {Array<ExtractedString>} strings the strings that've been pre-extracted from the
 *  file, as done by extract-i18n.js. This is optional, if not provided the
 *  strings will be extracted automatically.
 * @returns {string} the translated code string
 */
export const translateString = (
    textString: string,
    translatedStrings: TranslatedLocaleStrings,
    // If no pre-parsed strings where provided, then we need to parse them
    // (providing pre-parsed strings can be a performance optimization,
    // especially if you're translating a file into multiple languages).
    strings?: Array<ExtractedString> = getI18nStringsFromString(textString),
): string => {
    let translatedSource = textString;

    for (const {
        msgids: [msgid],
        startOffset,
        endOffset,
    } of strings) {
        const translatedString = translatedStrings[msgid];

        if (!translatedString) {
            // No translated string was found, we just leave the
            // English string in place. We could log something here
            // but this is very noisy (especially since some locales
            // either don't have translations or are intentionally
            // not translating some features).
            continue;
        }

        // Insert translated string into the source
        translatedSource =
            translatedSource.slice(0, startOffset) +
            // Stringifying the result gives us exactly what we want
            // (valid JS code that's properly escaped).
            JSON.stringify(translatedString) +
            translatedSource.slice(endOffset);
    }

    return translatedSource;
};
