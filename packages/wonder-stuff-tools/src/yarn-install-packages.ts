import {runCommand} from "./run-command";

import {PackagesComparison, TransformOptions} from "./types";

/**
 * Install the packages that were selected.
 *
 * @param cwd The current working directory where the command is executed.
 * @param transform Whether to transform imports.
 * @param pkgs A comparison of installed packages and their up-to-date versions.
 * @returns A promise that resolves to a message indicating what changes
 * were made.
 */
export function yarnInstallPackages(
    cwd: string,
    {pkgs, message}: PackagesComparison,
    transformOptions?: TransformOptions,
): Promise<string | undefined> {
    // Step 1: Install the packages.
    // We do this in one `yarn add` command to get some performance benefits.
    const packageList = pkgs.map(({name, alias, version}) =>
        name === alias
            ? `${name}@${version}`
            : `${alias}@npm:${name}@${version}`,
    );
    const installPromise = runCommand("yarn", {
        args: ["add", packageList.join(" ")],
        cwd,
    });

    // Step 2: Apply transforms.
    // This transforms any imports where aliases were involved and returns
    // the update message.
    return pkgs
        .reduce(
            (promiseChain, {name, alias}) =>
                promiseChain.then(() => {
                    // if transform flag is provided, or no aliases have been created, then skip this step
                    if (!transformOptions || name === alias) {
                        return "";
                    }

                    return runCommand(transformOptions.cmd, {
                        args: transformOptions.args,
                        cwd,
                    });
                }),
            installPromise,
        )
        .then(() => message);
}
