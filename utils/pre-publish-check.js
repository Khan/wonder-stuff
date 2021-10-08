/* eslint-disable no-console */
/**
 * Pre-publish checks to verify that our publish will go smoothly.
 */
const path = require("path");
const {exec} = require("child_process");
const fg = require("fast-glob");

const inquirer = require("inquirer");

const checkPublishConfig = ({name, publishConfig, private: isPrivate}) => {
    // first check if is marked as public and there's access to publish the current package
    if (!publishConfig || (!isPrivate && publishConfig.access !== "public")) {
        const requiredAccessType = isPrivate ? "restricted" : "public";

        console.error(
            `ERROR: ${name} is missing a "publishConfig": {"access": "${requiredAccessType}"} section.`,
        );
        process.exit(1);
    }

    // also check if is marked as private and there's restricted access defined
    if (isPrivate && publishConfig.access !== "restricted") {
        console.error(
            `ERROR: ${name} is marked as private but there is a "publishConfig": {"access": "public"} section already defined. Please change it to "access": "restricted" or remove "private": true to make the package public.`,
        );
        process.exit(1);
    }
};

const checkPackageField = (pkgJson, field, value) => {
    if (pkgJson[field] !== value) {
        console.error(
            `ERROR: ${
                pkgJson.name
            } must have a "${field}" set to ${JSON.stringify(value)}.`,
        );
        process.exit(1);
    }
};

const checkPackageEntrypoints = (pkgJson) => {
    checkPackageField(pkgJson, "module", "dist/es/index.js");
    checkPackageField(pkgJson, "main", "dist/index.js");
    if (pkgJson.browser) {
        const expectedValue = {
            [pkgJson.main]: "dist/index.browser.js",
            [pkgJson.module]: "dist/es/index.browser.js",
        };

        for (const key of Object.keys(pkgJson.browser)) {
            if (expectedValue[key] !== pkgJson.browser[key]) {
                console.error(
                    `ERROR: ${
                        pkgJson.name
                    } must have a "browser" set to \n${JSON.stringify(
                        expectedValue,
                        null,
                        4,
                    )}.`,
                );
                process.exit(1);
            }
        }
    }
};

const checkPackageSource = (pkgJson) =>
    checkPackageField(pkgJson, "source", "src/index.js");

const checkPackagePrivate = (pkgJson) => {
    if (pkgJson.private) {
        console.warn(
            `${pkgJson.name} is private and won't be published to NPM.`,
        );
        return true;
    }
    return false;
};

const checkNpmUser = (currentUser) => {
    if (currentUser.trim() !== "khanacademy") {
        console.error(
            `ERROR: You are not logged in to NPM as "khanacademy". ` +
                `Run "npm login" and use the password from: ` +
                `https://phabricator.khanacademy.org/K207`,
        );
        process.exit(1);
    }
};

// eslint-disable-next-line promise/catch-or-return
fg(path.join(__dirname, "..", "packages", "**", "package.json")).then(
    (pkgPaths) => {
        let warnings = false;

        // eslint-disable-next-line promise/always-return
        for (const pkgPath of pkgPaths) {
            const pkgJson = require(path.relative(__dirname, pkgPath));

            checkPublishConfig(pkgJson);
            checkPackageEntrypoints(pkgJson);
            checkPackageSource(pkgJson);
            warnings = checkPackagePrivate(pkgJson);
        }

        exec("npm whoami", (err, currentUser) => {
            checkNpmUser(currentUser);

            if (warnings) {
                inquirer
                    .prompt([
                        {
                            type: "confirm",
                            name: "skipWarnings",
                            default: false,
                            message:
                                "There are some potential problems, do you wish to continue?",
                        },
                    ])
                    .then(({skipWarnings}) => {
                        // If we're not skipping then we need to exit with an error
                        if (!skipWarnings) {
                            process.exit(1);
                        }
                        return;
                    })
                    .catch((e) => {
                        console.warn("inquirer prompt failed");
                        console.warn(e);
                        process.exit(1);
                    });
            }
        });
    },
);
