import {execSync} from "node:child_process";
import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {createInterface} from "node:readline/promises";
import {openBrowser} from "./open-browser";

/**
 * Validate that the given package name is a valid npm package name.
 *
 * @param name The package name to validate.
 *
 * @throws If the name is not valid.
 */
export function validatePackageName(name: string): void {
    // Basic npm package name validation
    if (!name || name.trim().length === 0) {
        throw new Error("Package name cannot be empty");
    }

    // Check for valid npm package name format
    // https://docs.npmjs.com/cli/v11/configuring-npm/package-json#name
    const validNameRegex =
        /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/;
    if (!validNameRegex.test(name)) {
        throw new Error(
            `Invalid package name: ${name}. Package names must be lowercase and can contain hyphens, underscores, and periods.`,
        );
    }

    if (name.length > 214) {
        throw new Error(
            `Package name too long: ${name}. Maximum length is 214 characters.`,
        );
    }
}

/**
 * Validates that the given access token is a valid npm granular access token.
 *
 * @param token The token to validate.
 * @throws if the token is not valid.
 */
export function validateAccessToken(token: string | null | undefined): void {
    const trimmedToken = token?.trim();

    // npm granular access tokens start with "npm_" and are typically longer
    if (!trimmedToken || trimmedToken.length === 0) {
        throw new Error("Access token cannot be empty");
    }

    // Check if it looks like an npm token
    if (!trimmedToken.startsWith("npm_")) {
        throw new Error(
            'Invalid token format. npm granular access tokens should start with "npm_"',
        );
    }

    // Basic length check (npm tokens are typically around 36+ characters)
    if (trimmedToken.length < 20) {
        throw new Error("Token appears to be too short to be valid");
    }
}

/**
 * Prompt the user for an npm granular access token.
 *
 * This prompts the user for a token and then writes it to the given
 * temporary directory.
 * @param tempDir The temporary directory to write the token to.
 */
export async function promptForAccessToken(tempDir: string): Promise<void> {
    console.log();
    console.log("=== npm Granular Access Token Required ===");
    console.log();
    console.log(
        "A granular access token is needed to publish the placeholder package.",
    );
    console.log();
    console.log("When creating the token, please configure it with:");
    console.log("  ✓ Expiration: 7 days (the default, or less if you prefer)");
    console.log("  ✓ Ensure 'Bypass two-factor authentication' is checked");
    console.log("  ✓ Permissions:");
    console.log("    • Read and write - only for the '@khanacademy' scope");
    console.log();
    console.log("Opening a browser window so that you can create the token...");
    console.log();

    const tokenCreationUrl =
        "https://www.npmjs.com/settings/khanacademy/tokens/granular-access-tokens/new";
    openBrowser(tokenCreationUrl);

    console.log(
        "After creating the token, copy it and paste it below (input will be hidden):",
    );
    console.log();

    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    let tokenValid = false;
    while (!tokenValid) {
        try {
            // Read token from stdin (note: readline doesn't support hidden input natively)
            const token = await rl.question("Access Token: ");

            // Validate the token
            validateAccessToken(token);
            console.log();
            console.log("✓ Token format is valid");

            // Create .npmrc file in temp directory with the token
            const npmrcContent = `//registry.npmjs.org/:_authToken=${token.trim()}\n`;
            await writeFile(join(tempDir, ".npmrc"), npmrcContent);
            console.log(
                "✓ Configured npm authentication for temporary directory",
            );

            tokenValid = true;
        } catch (error) {
            console.log();
            if (error instanceof Error) {
                console.error(`✗ ${error.message}`);
            } else {
                console.error("✗ Invalid token");
            }
            console.log("Please try again (or press Ctrl+C to cancel).");
            console.log();
        }
    }

    rl.close();
}

/**
 * Publish the package from the given temporary directory.
 */
export function publishPackage(tempDir: string): void {
    console.log();
    console.log("=== Publishing Package ===");
    console.log();
    console.log(`Publishing from ${tempDir}...`);
    console.log();

    try {
        execSync("pnpm publish", {
            cwd: tempDir,
            stdio: "inherit",
        });
        console.log();
    } catch (error) {
        throw new Error("pnpm publish failed");
    }
}
