/* eslint-disable no-console */
/**
 * Pre-publish utilities to verify that our publish will go smoothly.
 */
const fs = require("fs");
const path = require("path");

function isWonderStuffTool(pkgJson) {
    return pkgJson.name.startsWith("@khanacademy/wonder-stuff-tool-");
}

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

const checkField = (pkgJson, field, value) => {
    if (pkgJson[field] !== value) {
        console.error(
            `ERROR: ${
                pkgJson.name
            } must have a "${field}" set to ${JSON.stringify(value)}.`,
        );
        process.exit(1);
    }
};

const checkMain = (pkgJson) => checkField(pkgJson, "main", "dist/index.js");

const checkModule = (pkgJson) =>
    checkField(pkgJson, "module", "dist/es/index.js");

const checkTypes = (pkgJson) => checkField(pkgJson, "types", "dist/index.d.ts");

const checkPrivate = (pkgJson) => {
    if (pkgJson.private) {
        console.warn(
            `${pkgJson.name} is private and won't be published to NPM.`,
        );
        return true;
    }
    return false;
};

const checkBrowser = (pkgJson) => {
    if (pkgJson.browser) {
        const expectedValue = {
            [pkgJson.main]: "./dist/browser/index.js",
            [pkgJson.module]: "./dist/browser/es/index.js",
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

const checkBin = (pkgJson) => {
    if (!("bin" in pkgJson)) {
        console.error(`ERROR: ${pkgJson.name} must have a "bin" set.`);
        process.exit(1);
    }
};

const checkEntrypoints = (pkgJson) => {
    // wonder-stuff-tool packages don't need to export anything, but they do
    // need a bin entry!
    if (isWonderStuffTool(pkgJson)) {
        checkBin(pkgJson);
        return;
    }

    checkModule(pkgJson);
    checkMain(pkgJson);
    checkBrowser(pkgJson);
};

const checkMainPathExists = (pkgPath) => {
    const pkgJson = require(path.relative(__dirname, pkgPath));
    const mainPath = path.join(path.dirname(pkgPath), pkgJson.main);
    if (!fs.existsSync(mainPath)) {
        const {name, main} = pkgJson;
        console.error(
            `ERROR: ${name}'s "main" field is set to ${main}, but no file exists at that path.`,
        );
        process.exit(1);
    }
};

module.exports = {
    checkPublishConfig,
    checkEntrypoints,
    checkTypes,
    checkPrivate,
    checkMainPathExists,
    isWonderStuffTool,
};
