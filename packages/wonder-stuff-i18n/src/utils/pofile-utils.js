// @flow
import fs from "fs";
import path from "path";

import fglob from "fast-glob";
import PO from "pofile";

import {extractStrings} from "./extract-i18n.js";
import {getIgnoreGlobs} from "./i18n-utils.js";

import type {ExtractedString} from "./extract-i18n.js";

type POItem = {|
    msgid: string,
    msgid_plural: string,
    flags: {[string]: boolean},
    references: Array<string>,
    extractedComments: Array<string>,
|};

/**
 * Construct a POItem from a filename and extracted string.
 *
 * @param {string} fileName the file the string was extracted from
 * @param {ExtractedString} extractedString the string extracted from the file
 * @returns {POItem}
 */
export const buildPoItem = (
    fileName: string,
    {linePos, type, msgids: [msgid, plural], comments}: ExtractedString,
): POItem => {
    // If we haven't seen this string before we build a PO Item.
    const poItem: POItem = new PO.Item();

    // Add the primary string
    poItem.msgid = msgid;

    // If the string is plural
    if (type === "ngettext") {
        // We track the plural form
        poItem.msgid_plural = plural;

        // Set the python-format variable so that Crowdin knowns to
        // mark %(...)s variables up appropriately.
        if (poItem.msgid_plural.includes("%(")) {
            poItem.flags["python-format"] = true;
        }
    } else if (poItem.msgid.includes("%(")) {
        // Set the python-format variable so that Crowdin knowns to
        // mark %(...)s variables up appropriately.
        poItem.flags["python-format"] = true;
    }

    // Keep track of what file and line this string was found on
    poItem.references = [`${fileName}:${linePos}`];

    // Add any comments that were attached to the string
    poItem.extractedComments = comments;

    return poItem;
};

/**
 * Merge an extracted string into an existing POItem.
 *
 * @param {POItem} poItem the POItem to merge the match into.
 * @param {string} fileName the filename to add to the POItem
 * @param {ExtractedString} extractedString the extracted string to merge into
 * the existing POItem.
 */
export const mergePoItem = (
    poItem: POItem,
    fileName: string,
    {linePos, msgids: [msgid, plural], comments}: ExtractedString,
) => {
    // Make sure that we aren't trying to merge a plural and a
    // non-plural form of a string, or that the plural forms don't
    // match each other.
    if ((poItem.msgid_plural || plural) && poItem.msgid_plural !== plural) {
        // eslint-disable-next-line no-console
        console.error(
            `Plural of "${plural}" found that doesn't ` +
                `match an existing plural for "${msgid}".`,
        );
        process.exit(1);
    }

    // I would imagine that we would append it to the list, but that
    // generates a different output from our old PO file generation
    // (one per line). So instead we append it to the first reference
    // giving us a bunch of references on one line.
    poItem.references[0] += ` ${fileName}:${linePos}`;

    // Comments are added seemingly in reverse order. We maintain that
    // here to match the legacy PO file output.
    for (const comment of comments) {
        if (!poItem.extractedComments.includes(comment)) {
            poItem.extractedComments.unshift(comment);
        }
    }
};

/**
 * Generate a Map of POItems (from msgid -> POItem), generated from extracted
 * strings that come from the specified list of files.
 *
 * @param {Array<string>} files a list of files to extract strings from files
 * @returns {Map<string, POItem>}
 */
export const getPoItemMap = (files: Array<string>): Map<string, POItem> => {
    const poItemMap = new Map();

    for (const file of files) {
        const textString = fs.readFileSync(file, "utf8");
        const fileName = path.relative(process.cwd(), file);

        // Get all of the strings out of the file
        for (const extractedString of extractStrings(textString)) {
            const [msgid] = extractedString.msgids;

            // If we've already found this string in another file
            const poItem = poItemMap.get(msgid);
            if (poItem) {
                mergePoItem(poItem, fileName, extractedString);
            } else {
                poItemMap.set(msgid, buildPoItem(fileName, extractedString));
            }
        }
    }

    return poItemMap;
};

/**
 * Get a list of files to attempt to extract strings from.
 *
 * @param {Array<string>} userSpecifiedFiles a list of files to attempt to
 *  extract strings from.
 * @returns {Array<string>}
 */
export const getFilesToExtractFrom = (
    userSpecifiedFiles: Array<string>,
): Array<string> => {
    // If any files are passed in on the command-line, run them through fast-glob
    // to match any patterns and make sure they actually exist.
    const cliFiles = fglob.sync(userSpecifiedFiles, {
        dot: true,
        ignore: getIgnoreGlobs(),
    });

    // We remove all files that aren't expected to have translate-able strings
    return cliFiles.sort();
};

/**
 * Given a list of files, extract i18n strings from them and generate a string
 * version of a POT file.
 *
 * @param {Array<string>} files a list of files to extract strings from files
 * @returns {string}
 */
export const getPOTFileStringFromFiles = (files: Array<string>): string => {
    const potfile = new PO();

    // Normally items would be an array, but we can get away with passing in
    // the map as internally pofile will just iterate through the items.
    potfile.items = getPoItemMap(files);

    return potfile.toString();
};
