import {parseArgs} from "./parse-args";
import {createTempDirectory, tryCleanupTempDirectory} from "./fs";
import {detectGitRepoOriginUrl, parseRepoInfo} from "./git";
import {
    validatePackageName,
    verifyNpmLogin,
    publishPackage,
    logoutOfNpm,
} from "./npm";
import {printNextSteps} from "./print-next-steps";
import {writePackageFiles} from "./write-package-files";

/**
 * The entry to the process of publishing a placeholder npm package. This
 * function coordinates the entire operation on behalf of the user.
 */
export async function publishPlaceholderPackage() {
    // Parse and validate arguments
    const {packageName, cleanup: shouldCleanup} = parseArgs();
    let tempDir: string | null = null;
    let npmUsername: string | null = null;
    let failed = false;

    try {
        // Step 1: Validate package name
        console.log(`Validating package name: ${packageName}`);
        validatePackageName(packageName);
        console.log("✓ Package name is valid");

        // Step 2: Verify npm authentication
        console.log("\nVerifying npm login...");
        npmUsername = verifyNpmLogin();

        // Step 3: Detect git repository
        console.log("\nDetecting git repository...");
        const gitUrl = detectGitRepoOriginUrl(process.cwd());
        const repoName = parseRepoInfo(gitUrl);
        console.log(`✓ Detected repository: ${repoName}`);

        // Step 4: Create temporary directory and files
        console.log("\nCreating placeholder package...");
        tempDir = await createTempDirectory();
        await writePackageFiles(tempDir, packageName, repoName);

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

        failed = true;
    } finally {
        // Step 8: Log out of npm, whether or not everything else worked, so
        // that we don't leave a login session behind. If we never got as far
        // as confirming a login, there's nothing to log out of.
        if (npmUsername != null) {
            console.log("\nLogging out of npm...");
            logoutOfNpm();
        }
    }

    if (failed) {
        // Note that we exit here, rather than in the `catch` above, because
        // `process.exit` would stop us from ever logging out.
        process.exit(1);
    }

    console.log("\n✓ All done!");
}
