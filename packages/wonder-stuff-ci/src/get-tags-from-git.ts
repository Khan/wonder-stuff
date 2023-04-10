import {execAsync} from "./exec-async";

/**
 * Get all tags from git.
 *
 * @returns {Promise<Array<string>>} A promise of all git tags sorted by creation time ascending.
 */
export const getTagsFromGit = async (): Promise<Array<string>> => {
    // Why not use simple-git here? Because for some reason it takes like 100x as long.
    await execAsync("git fetch --tags");
    const {stdout} = await execAsync("git tag");
    return stdout.split("\n").filter(Boolean);
};
