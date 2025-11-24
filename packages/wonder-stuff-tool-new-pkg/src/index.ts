#!/usr/bin/env node

import process from "node:process";
import {promptForAccessToken, publishPackage, validatePackageName} from "./npm";
import {detectGitRepoOriginUrl, parseRepoInfo} from "./git";
import {
    cleanupTempDirectory as tryCleanupTempDirectory,
    createTempDirectory,
} from "./fs";
import {parseArgs} from "./parse-args";
import {writeFiles} from "./write-files";

function printNextSteps(packageName: string): void {
    console.log("\n=== Next Steps ===");
    console.log(`
1. Go to https://www.npmjs.com/package/${packageName
        .replace("@", "")
        .replace(/\//g, "%2F")}
2. Navigate to the package settings
3. Configure Trusted Publishing for your GitHub repository
4. You can now publish new versions using GitHub Actions without needing tokens!

For more information on Trusted Publishing, visit:
https://docs.npmjs.com/trusted-publishers
`);
}

async function main(): Promise<void> {
    // Parse and validate arguments
    const {packageName, cleanup: shouldCleanup} = parseArgs();
    let tempDir: string | null = null;

    try {
        // Step 1: Validate package name
        console.log(`Validating package name: ${packageName}`);
        validatePackageName(packageName);
        console.log("✓ Package name is valid");

        // Step 2: Detect git repository
        console.log("\nDetecting git repository...");
        const gitUrl = detectGitRepoOriginUrl(process.cwd());
        const repoName = parseRepoInfo(gitUrl);
        console.log(`✓ Detected repository: ${repoName}`);

        // Step 3: Create temporary directory and files
        console.log("\nCreating placeholder package...");
        tempDir = await createTempDirectory();
        await writeFiles(tempDir, packageName, repoName);

        // Step 4: NPM authentication
        await promptForAccessToken(tempDir);

        // Step 5: Publish package
        publishPackage(tempDir);

        // Step 6: Cleanup temp directory
        if (shouldCleanup) {
            console.log("\nCleaning up...");
            await tryCleanupTempDirectory(tempDir);
            tempDir = null;
        } else {
            console.log(`\nSkipping cleanup. Temporary directory: ${tempDir}`);
        }

        // Step 7: Next steps
        printNextSteps(packageName);

        console.log("\n✓ All done!");
    } catch (error) {
        console.error(
            "\n✗ Error:",
            error instanceof Error ? error.message : String(error),
        );

        if (shouldCleanup) {
            await tryCleanupTempDirectory(tempDir);
        } else if (tempDir) {
            console.log(`\nTemporary directory preserved at: ${tempDir}`);
        }

        process.exit(1);
    }
}

// Start the main process
main();
