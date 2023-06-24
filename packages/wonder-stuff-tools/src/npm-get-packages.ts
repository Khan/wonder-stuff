import {runCommand} from "./run-command.js";

/**
 * Query NPM for all packages with the given prefix.
 *
 * This allows us to search for all @khanacademy/wonder-stuff- or
 * @khanacademy/wonder-blocks- packages.
 *
 * @param pkgSetName The human-readable name of the package set.
 * e.g. "Wonder Blocks" or "Wonder Stuff".
 * @param pkgPrefix The prefix to search for.
 * e.g. "@khanacademy/wonder-blocks-" or "@khanacademy/wonder-stuff-".
 * @returns A promise that resolves to an array of package names.
 */
export function npmGetPackages(
    pkgPrefix: string,
    searchLimit = 1000,
): Promise<Array<string>> {
    return runCommand("npm", {
        args: ["search", pkgPrefix, "--json", `--searchlimit=${searchLimit}`],
    }).then((rawPkgList) => {
        const pkgList: Array<{name: string}> = JSON.parse(rawPkgList);
        return pkgList
            .map(({name}) => name)
            .sort()
            .filter((name) => name.startsWith(pkgPrefix));
    });
}
