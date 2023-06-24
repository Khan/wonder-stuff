import * as path from "path";
import inquirer from "inquirer";

import {PackageVersions, PackagesComparison} from "./types";

/**
 * Compare the current package.json with the published versions.
 *
 * This determines what packages are to be added, aliased, or updated, including
 * asking the user to make appropriate selections. It also builds a message
 * that can be used to put into a commit message.
 *
 * @param pkgSetName The human-readable name of the package set.
 * e.g. "Wonder Blocks" or "Wonder Stuff".
 * @param pkgs An array of package names and information about their published
 * versions.
 * @returns {Promise<{
 *  pkgs: Array<{alias: string, version: string, name: string}>,
 *  message: string,
 * }>} A promise that resolves to an object with the packages to be installed
 * and a message to put into a commit message.
 */
export async function comparePkgsWithInstalled(
    pkgJsonPath: string,
    pkgSetName: string,
    pkgs: Array<PackageVersions>,
): Promise<PackagesComparison> {
    // We look at what we've installed in webapp as a dependency
    const pkgJson = await import(path.relative(__dirname, pkgJsonPath));
    const toAdd = [];
    const toAddAlias = [];
    const toUpdate = [];

    for (const {name, versions} of pkgs) {
        for (const {alias, version, outdated} of versions) {
            // We need to see if the package has already been installed
            // given our desired alias.
            const currentAliasVersion =
                pkgJson.dependencies[alias] || pkgJson.devDependencies[alias];
            // also check if the package is completely new
            const currentVersion =
                pkgJson.dependencies[name] || pkgJson.devDependencies[name];

            if (currentAliasVersion) {
                // if alias found
                const oldVersion = /@([\d.]+)$/.exec(currentAliasVersion)?.[1];
                // We check to see if the version has changed, if so we need
                // to update it.
                if (oldVersion !== version) {
                    toUpdate.push({name, alias, version, oldVersion});
                }
            } else if (currentVersion) {
                // if package without alias is currently installed
                const majorVersion = parseInt(/^\d+/.exec(version)?.[0] ?? "");
                const majorInstalledVersion = parseInt(
                    /^\^?\d+/.exec(currentVersion)?.[0] ?? "",
                );

                // if a new version is available
                if (!outdated && currentVersion !== version) {
                    // update package
                    toUpdate.push({
                        name,
                        alias: name,
                        version,
                        oldVersion: currentVersion,
                    });

                    // new major version available, add alias (e.g. *-v1)
                    if (majorInstalledVersion < majorVersion) {
                        toAddAlias.push({
                            name,
                            alias: `${name}-v${majorInstalledVersion}`,
                            version: currentVersion,
                            oldVersion: currentVersion,
                        });
                    }
                }
            } else {
                // If the package isn't outdated, and isn't already installed,
                // then we need to add it.
                toAdd.push({name, alias: name, version});
            }
        }
    }

    if (
        toAdd.length === 0 &&
        toUpdate.length === 0 &&
        toAddAlias.length === 0
    ) {
        return {
            pkgs: [],
            message: "",
        };
    }

    const {toInstall} = await inquirer.prompt([
        {
            type: "checkbox",
            name: "toInstall",
            message: `Which ${pkgSetName} modules to install?`,
            choices: [
                ...toAdd.map((value) => ({
                    name: `${value.alias} (NEW: ${value.version})`,
                    value,
                    checked: true,
                })),
                ...toAddAlias.map((value) => ({
                    name: `${value.alias} (ALIAS: ${value.version})`,
                    value,
                    checked: true,
                })),
                ...toUpdate.map((value) => ({
                    name: `${value.alias} (${value.oldVersion} -> ${value.version})`,
                    value,
                    checked: true,
                })),
            ],
        },
    ]);

    if (!toInstall) {
        process.exit(0);
    }

    const message = [];
    const added = [];
    const updated = [];
    const addedAlias = [];

    for (const {alias, version} of toInstall) {
        const wasAdded = toAdd.find(
            (v) => v.alias === alias && v.version === version,
        );
        if (wasAdded != null) {
            added.push(wasAdded);
        }

        const wasUpdated = toUpdate.find(
            (v) => v.alias === alias && v.version === version,
        );
        if (wasUpdated != null) {
            updated.push(wasUpdated);
        }

        const wasAddedAlias = toAddAlias.find(
            (v) => v.alias === alias && v.version === version,
        );
        if (wasAddedAlias != null) {
            addedAlias.push(wasAddedAlias);
        }
    }

    if (added.length > 0) {
        message.push(
            "\nThe following packages are being added:",
            ...added.map(({alias, version}) => ` - ${alias} (${version})`),
        );
    }

    if (updated.length > 0) {
        message.push(
            "\nThe following packages are being updated:",
            ...updated.map(
                ({alias, version, oldVersion}) =>
                    ` - ${alias} (${oldVersion} -> ${version})`,
            ),
        );
    }

    if (addedAlias.length > 0) {
        message.push(
            "\nThe following aliases are being added:",
            ...addedAlias.map(
                ({alias, version, oldVersion}) =>
                    ` - ${alias} (${oldVersion} -> ${version})`,
            ),
        );
    }

    return {
        pkgs: toInstall,
        message: message.join("\n"),
    };
}
