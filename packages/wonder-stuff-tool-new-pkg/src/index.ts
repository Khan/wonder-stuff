#!/usr/bin/env node

import process from "node:process";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import yargs from "yargs";
import {hideBin} from "yargs/helpers";
import {promptForAccessToken, publishPackage, validatePackageName} from "./npm";
import {detectGitRepoOriginUrl, parseRepoInfo} from "./git";
import {
    cleanupTempDirectory as tryCleanupTempDirectory,
    createTempDirectory,
} from "./fs";
import {
    generatePackageJson,
    generateReadme,
    generateIndexJs,
} from "./placeholder_package";

interface ParsedArgs {
    packageName: string;
    cleanup: boolean;
}

function parseArgs(): ParsedArgs {
    const argv = yargs(hideBin(process.argv))
        .scriptName("wonder-stuff-tool-publish-new-pkg")
        .usage(
            "Usage: $0 <package-name> [options]\n\n" +
                "Helps with setting up Trusted Publishing for a new npm package by publishing a placeholder npm package which can then be configured.",
        )
        .demandCommand(1, 1, "You must provide exactly one package name")
        .option("cleanup", {
            type: "boolean",
            default: true,
            describe: "Clean up the temporary directory after publishing",
        })
        .help()
        .alias("help", "h")
        .strict()
        .parseSync();

    const packageName = argv._[0] as string;

    return {
        packageName,
        cleanup: argv.cleanup,
    };
}

async function writeFiles(
    tempDir: string,
    packageName: string,
    repoName: string,
): Promise<void> {
    await writeFile(
        join(tempDir, "package.json"),
        generatePackageJson(packageName, repoName),
    );
    await writeFile(join(tempDir, "README.md"), generateReadme(packageName));
    await writeFile(join(tempDir, "index.js"), generateIndexJs());

    console.log(`✓ Created placeholder files in ${tempDir}`);
}

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
