import {execSync} from "node:child_process";

export function detectGitRepo(cwd: string): string {
    const url = execSync("git remote get-url origin", {
        encoding: "utf-8",
        stdio: ["pipe", "pipe", "pipe"],
        cwd,
    }).trim();
    return url;
}

export function parseRepoInfo(url: string): string {
    // Handle various git URL formats:
    // - https://github.com/Khan/wonder-stuff.git
    // - git@github.com:Khan/wonder-stuff.git
    // - git+https://github.com/Khan/wonder-stuff.git

    // Remove .git suffix
    let cleaned = url.replace(/\.git$/, "");

    // Extract org/repo from URL
    let match = cleaned.match(/github\.com[/:]([\w-]+\/[\w-]+)/);
    if (match) {
        return match[1];
    }

    throw new Error(`Could not parse repository info from URL: ${url}`);
}
