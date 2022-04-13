#!/usr/bin/env node
// @flow
/* istanbul ignore file */
/* eslint-disable no-console */
/**
 * Find newly-introduced i18n strings, when comparing two lists of strings.
 * Meant to be used together with the `all-i18n-strings.js` script.
 *
 * USAGE:
 *
 *   ./find-new-i18n-strings.js before-strings.txt after-strings.txt
 */
import fs from "fs";

const [beforeFile, afterFile] = process.argv.slice(2);

if (!beforeFile || !afterFile) {
    console.error(
        "Usage: ./webpack/tools/find-new-i18n-strings.js before-strings.txt after-strings.txt",
    );
    process.exit(1);
}

const beforeStrings = new Set(fs.readFileSync(beforeFile, "utf8").split("\n"));
const afterStrings = new Set(fs.readFileSync(afterFile, "utf8").split("\n"));

for (const msgid of beforeStrings) {
    afterStrings.delete(msgid);
}

if (afterStrings.size > 0) {
    const title = encodeURIComponent("New Platform Strings for Translation");
    const description = encodeURIComponent(
        "The following platform strings are being added to the site and are in need of translation:\n\n" +
            Array.from(afterStrings)
                .map((msgid) => ` * {{${msgid}}}`)
                .join("\n"),
    );
    const link = `https://khanacademy.atlassian.net/secure/CreateIssueDetails!init.jspa?pid=10162&issuetype=10251&summary=${title}&customfield_10256=${description}`;
    console.log("## New i18n Strings for Translation\n");
    console.log(
        "Your pull request has introduced new strings that need to " +
            `be translated. Please [submit a Translation Request](${link}) ` +
            "with the following strings so that the translation team can get started!\n",
    );
    console.log("### New Strings:\n");
    for (const msgid of afterStrings) {
        console.log(` * \`${msgid}\``);
    }
    console.log(`### » 🎉 [Submit Translation Request](${link}) 🎉 «`);
}
