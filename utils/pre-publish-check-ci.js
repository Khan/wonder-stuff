/* eslint-disable no-console */
/**
 * Pre-publish checks to verify that our publish will go smoothly.
 */
const path = require("path");
const fg = require("fast-glob");

const {
    checkPrivate,
    checkEntrypoints,
    checkTypes,
    checkPublishConfig,
    checkMainPathExists,
} = require("./pre-publish-utils");

// eslint-disable-next-line promise/catch-or-return
fg(path.join(__dirname, "..", "packages", "*", "package.json")).then(
    (pkgPaths) => {
        // eslint-disable-next-line promise/always-return
        for (const pkgPath of pkgPaths) {
            const pkgJson = require(path.relative(__dirname, pkgPath));

            if (!checkPrivate(pkgJson)) {
                if (pkgJson.nobuild) {
                    checkMainPathExists(pkgPath);
                } else {
                    checkPublishConfig(pkgJson);
                    checkEntrypoints(pkgJson);
                    checkTypes(pkgJson);
                }
            }
        }
    },
);
