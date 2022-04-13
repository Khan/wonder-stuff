#!/usr/bin/env node
// @flow
/**
 * Generates a POT file containing all strings marked for translation. The POT
 * file is output to STDOUT.
 *
 * You can specify files on the command-line and this script will only extract
 * strings from those files, instead of from all JavaScript file.
 *
 * USAGE:
 *
 *   # Extract strings from all JS files and export to a shared POT file
 *   ./gen-potfile.js javascript/**\/*.{js,jsx} > JavaScript.pot
 *
 *   # Extract strings from a specific file and output to STDOUT
 *   ./gen-potfile.js javascript/about/about.jsx
 */
import {
    getFilesToExtractFrom,
    getPOTFileStringFromFiles,
} from "../utils/pofile-utils.js";

// Get the files that we want to process.
const files = getFilesToExtractFrom(process.argv.slice(2));

// Generate the POT file as a string and output it to STDOUT
// eslint-disable-next-line no-console
console.log(getPOTFileStringFromFiles(files));
