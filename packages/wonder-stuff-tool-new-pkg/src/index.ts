#!/usr/bin/env node

import process from "node:process";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {promptForAccessToken, publishPackage, validatePackageName} from "./npm";
import {detectGitRepo, parseRepoInfo} from "./git";
import {
    cleanupTempDirectory as tryCleanupTempDirectory,
    createTempDirectory,
} from "./fs";
import {
    generatePackageJson,
    generateReadme,
    generateIndexJs,
} from "./placeholder_package";

function help(): void {
    console.log(`
Usage: pnpm dlx @khanacademy/wonder-stuff-tool-publish-new-pkg <package-name> [options]

This tool helps in publishing a placeholder npm package which can then be configured for Trusted Publishing.

Arguments:
  <package-name>  The name of the package to publish (e.g., @khanacademy/my-package)

Options:
  --no-cleanup    Keep the temporary directory after publishing (useful for debugging)
`);
}

interface ParsedArgs {
    packageName: string;
    shouldCleanup: boolean;
}

function parseArgs(args: string[]): ParsedArgs {
    if (args.length < 1 || args.length > 2) {
        help();
        process.exit(1);
    }

    // Separate flags from package name
    const flags = args.filter((arg) => arg.startsWith("--"));
    const nonFlags = args.filter((arg) => !arg.startsWith("--"));

    // Validate that we have exactly one package name
    if (nonFlags.length === 0) {
        console.error("\n✗ Error: Package name is required");
        help();
        process.exit(1);
    }

    if (nonFlags.length > 1) {
        console.error(
            `\n✗ Error: Expected one package name, got ${
                nonFlags.length
            }: ${nonFlags.join(", ")}`,
        );
        help();
        process.exit(1);
    }

    const packageName = nonFlags[0];

    // Validate that we only have known flags
    const unknownFlags = flags.filter((flag) => flag !== "--no-cleanup");
    if (unknownFlags.length > 0) {
        console.error(`\n✗ Error: Unknown flag(s): ${unknownFlags.join(", ")}`);
        help();
        process.exit(1);
    }

    const shouldCleanup = !flags.includes("--no-cleanup");

    return {packageName, shouldCleanup};
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

async function main(args: string[]): Promise<void> {
    // Parse and validate arguments
    const {packageName, shouldCleanup} = parseArgs(args);
    let tempDir: string | null = null;

    try {
        // Step 1: Validate package name
        console.log(`Validating package name: ${packageName}`);
        validatePackageName(packageName);
        console.log("✓ Package name is valid");

        // Step 2: Detect git repository
        console.log("\nDetecting git repository...");
        const gitUrl = detectGitRepo();
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

// process.argv includes `node` and the CLI filename being executed. We only
// care about the args passed to this script so we slice off the first two
// parameters.
main(process.argv.slice(2));
