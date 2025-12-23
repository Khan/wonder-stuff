import {execSync} from "node:child_process";

/**
 * Open the system's default browser to the given url.
 */
export function openBrowser(url: string): void {
    try {
        // Detect platform and use appropriate command
        const platform = process.platform;
        let command: string;

        if (platform === "darwin") {
            command = `open "${url}"`;
        } else if (platform === "win32") {
            command = `start "${url}"`;
        } else {
            // Linux and others
            command = `xdg-open "${url}"`;
        }

        execSync(command, {stdio: "ignore"});
    } catch (error) {
        console.warn(
            `Could not automatically open browser. Please visit: ${url}`,
        );
    }
}
