import {keys} from "@khanacademy/wonder-stuff-core";

import {runCommand} from "./run-command";
import {PackageVersions} from "./types";

/**
 * Query NPM for each package in a set to get the published versions.
 *
 * @param pkgs An array of package names.
 * @returns A promise that resolves to an object with the package name and
 * an array of information about published versions of that package.
 */
export function npmGetAndMapPublishedVersions(
    pkgs: Array<string>,
): Promise<Array<PackageVersions>> {
    return Promise.all(
        pkgs.map((pkgName) =>
            runCommand("npm", {
                args: ["view", pkgName, "versions", "--json"],
            }).then((rawVersions: string) => {
                const versions = JSON.parse(rawVersions);
                const majorVersionsToMostRecentFullVersion: {
                    [majorVersion: string]: string;
                } = {};

                for (const version of versions) {
                    const versionInfo = /^\d+/.exec(version);
                    // Verify that there's at least more than one version
                    // released.
                    if (versionInfo) {
                        const majorVersion = versionInfo[0];
                        majorVersionsToMostRecentFullVersion[majorVersion] =
                            version;
                    }
                }

                const allMajorVersions = keys(
                    majorVersionsToMostRecentFullVersion,
                );
                const latestMajorVersion =
                    allMajorVersions[allMajorVersions.length - 1];

                return {
                    name: pkgName,
                    versions: allMajorVersions.map((majorVersion) => ({
                        alias: `${pkgName}-v${majorVersion}`,
                        version:
                            majorVersionsToMostRecentFullVersion[majorVersion],
                        // We track if the version is outdated as that allows
                        // us to make a decision about if we need to install
                        // the change, or not. If a package is updated and
                        // already installed, we always install it. However,
                        // if the package is brand new we need to make sure
                        // that there isn't a newer one that we already have
                        // this makes it so that we can remove versions that
                        // we aren't using and they won't get re-installed.
                        outdated: latestMajorVersion !== majorVersion,
                    })),
                };
            }),
        ),
    );
}
