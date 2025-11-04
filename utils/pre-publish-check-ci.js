/* eslint-disable no-console */
/**
 * Pre-publish checks to verify that our publish will go smoothly.
 */
const path = require("path");
const fg = require("fast-glob");
const Ancesdir = require("ancesdir");

const {
    checkPrivate,
    checkEntrypoints,
    checkTypes,
    checkPublishConfig,
    checkMainPathExists,
} = require("./pre-publish-utils");

// eslint-disable-next-line promise/catch-or-return
fg("packages/*/package.json", {cwd: Ancesdir.default()}).then((pkgPaths) => {
    // eslint-disable-next-line promise/always-return
    for (const pkgPath of pkgPaths) {
        const pkgJson = require(path.relative(__dirname, pkgPath));
        const pkgName = pkgJson.name;

        if (!checkPrivate(pkgJson)) {
            if (pkgJson.nobuild) {
                checkMainPathExists(pkgPath);
            } else {
                checkPublishConfig(pkgJson);
                checkEntrypoints(pkgJson);
                // The eslint packages don't publish types.
                if (!pkgName.includes("eslint")) {
                    checkTypes(pkgJson);
                }
            }
        }
    }
});
