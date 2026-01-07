import {execSync} from "node:child_process";

/**
 * Detect the origin URL of a git repository.
 *
 * @param cwd The current working directory to detect the git repository in.
 * @returns The git remote origin URL.
 */
export function detectGitRepoOriginUrl(cwd: string): string {
    return execSync("git remote get-url origin", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        cwd,
    }).trim();
}

/**
 * Parse the repository name from the given git remote URL.
 *
 * @param remoteUrl The git remote URL to parse.
 * @returns The repository name in the format "owner/repo".
 */
export function parseRepoInfo(remoteUrl: string): string {
    // Handle various git URL formats:
    // - https://github.com/Khan/wonder-stuff.git
    // - git@github.com:Khan/wonder-stuff.git
    // - git+https://github.com/Khan/wonder-stuff.git

    // Remove .git suffix
    const cleaned = remoteUrl.replace(/\.git$/, "");

    // Extract org/repo from URL
    const match = cleaned.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    if (match) {
        return match[1];
    }

    throw new Error(`Could not parse repository info from URL: ${remoteUrl}`);
}
