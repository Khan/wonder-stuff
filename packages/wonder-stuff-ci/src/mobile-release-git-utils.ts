import execProm from "./exec-prom";

/**
 *
 * @returns all release tags sorted creation time ascending
 */
export const allMobileReleaseTags = async (): Promise<Array<string>> => {
    // Why not use simple-git here? Because for some reason it takes like 100x as long.
    await execProm("git fetch --tags");
    const {stdout} = await execProm(
        "git tag | grep -E -i -w 'ios|android|unified'",
    );
    return stdout.split("\n").filter(Boolean);
};
