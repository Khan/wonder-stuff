import {runCommand} from "./run-command";

/**
 * Check the repo for WIP changes.
 */
export function gitCheckRepo(cwd: string): Promise<string> {
    // Disallow WIP commits
    return runCommand("git", {
        args: ["diff", "--stat", "--exit-code", "HEAD"],
        cwd,
    });
}
