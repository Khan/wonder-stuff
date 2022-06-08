/* eslint-disable no-console */
/**
 * Pre-publish checks to verify that our publish will go smoothly.
 */
const fs = require("fs");
const path = require("path");
const fg = require("fast-glob");

const {
    checkPrivate,
    checkEntrypoints,
    checkSource,
    checkPublishConfig,
} = require("./pre-publish-utils.js");

// eslint-disable-next-line promise/catch-or-return
fg(path.join(__dirname, "..", "packages", "**", "package.json")).then(
    (pkgPaths) => {
        // eslint-disable-next-line promise/always-return
        for (const pkgPath of pkgPaths) {
            const pkgJson = require(path.relative(__dirname, pkgPath));

            // Skip over packages don't have a build step
            if (pkgJson.nobuild) {
                const mainPath = path.join(path.dirname(pkgPath), pkgJson.main);
                if (!fs.existsSync(mainPath)) {
                    const {name, main} = pkgJson;
                    console.error(
                        `ERROR: ${name}'s "main" field is set to ${main}, but no file exists at that path.`,
                    );
                    process.exit(1);
                }
                continue;
            }

            if (!checkPrivate(pkgJson)) {
                checkPublishConfig(pkgJson);
                checkEntrypoints(pkgJson);
                checkSource(pkgJson);
            }
        }
    },
);
