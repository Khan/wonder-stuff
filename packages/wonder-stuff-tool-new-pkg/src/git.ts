import {execSync} from "node:child_process";

export function detectGitRepo(): string {
    try {
        const url = execSync("git remote get-url origin", {
            encoding: "utf-8",
            stdio: ["pipe", "pipe", "pipe"],
        }).trim();
        return url;
    } catch (error) {
        throw new Error(
            "Failed to detect git repository. Make sure you're in a git repository with a remote named 'origin'.",
        );
    }
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
