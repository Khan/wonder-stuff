/* eslint-disable no-console */
import * as path from "path";
import chalk from "chalk";

import {gitCheckRepo} from "./git-check-repo";
import {npmGetPackages} from "./npm-get-packages";
import {npmGetAndMapPublishedVersions} from "./npm-get-and-map-published-versions";
import {comparePkgsWithInstalled} from "./compare-pkgs-with-installed";
import {yarnInstallPackages} from "./yarn-install-packages";

import {UpdatePackagesOptions} from "./types";

// STOPSHIP: Need to throw specific errors for different things and
// then the tool implementation can handle them. Also possibly a logging
// interface?

/**
 * Deploy package updates for a specific package set.
 *
 * @param options Options that control how packages are identified and updated.
 */
export async function updatePackages({
    pkgPrefix,
    pkgSetName,
    transformOptions,
    searchLimit,
    cwd = process.cwd(),
}: UpdatePackagesOptions) {
    // We first verify that there are no WIP changes as we'll be generating
    // a new commit at the end of this and don't want to include other files.
    await gitCheckRepo(cwd);

    // We then query NPM and get a list of all available Wonder Blocks
    // packages.
    const allPkgs = await npmGetPackages(pkgPrefix, searchLimit);

    // For each of those packages we get a list of all available versions
    // We map each version to a it's major version (1.0.1 -> v1)
    const pkgVersions = await npmGetAndMapPublishedVersions(allPkgs);

    // We compare the latest version of each package to what's already
    // installed and determine what needs to be added and updated.
    const pkgJsonPath = path.join(cwd, "package.json");
    const compareResult = await comparePkgsWithInstalled(
        pkgJsonPath,
        pkgSetName,
        pkgVersions,
    );

    // We then install those packages
    const message = await yarnInstallPackages(
        cwd,
        compareResult,
        transformOptions,
    );

    // Output all of the changes with a formatted message that could be used after manually verifying changes
    console.log(
        "Changes ready to be commited. Please verify everything works as expected. You can use the following information when communicating these changes.",
    );
    console.log(chalk.green(`"Updating ${pkgSetName}\n${message}"`));
}
