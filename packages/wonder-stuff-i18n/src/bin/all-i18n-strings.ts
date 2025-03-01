#!/usr/bin/env node
/* istanbul ignore file */
/* eslint-disable no-console */
/**
 * Extract all i18n strings from JS files.
 *
 * USAGE:
 *
 *   pnpm all-i18n-strings file.js
 *   pnpm all-i18n-strings "src/*.js"
 */
import {getFilesToExtractFrom, getPoItemMap} from "../utils/pofile-utils";

// Get the files that we want to process.
const files = getFilesToExtractFrom(process.argv.slice(2));

// Get the list of strings found in those files.
for (const [msgid, poItem] of getPoItemMap(files)) {
    if (poItem.msgid_plural) {
        console.log(`${msgid} (plural: ${poItem.msgid_plural})`);
    } else {
        console.log(msgid);
    }
}
