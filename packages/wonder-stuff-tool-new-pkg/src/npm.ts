import {execSync} from "node:child_process";

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
 * Verify that the current user is logged in to npm.
 *
 * Publishing the placeholder package requires an authenticated npm user.
 * Rather than dealing with access tokens, we rely on the user having already
 * logged in with `pnpm login`.
 *
 * @returns The npm username that is logged in.
 * @throws If the user is not logged in to npm.
 */
export function verifyNpmLogin(): string {
    let username: string | undefined;
    try {
        username = execSync("pnpm whoami", {
            encoding: "utf-8",
            stdio: ["ignore", "pipe", "pipe"],
        }).trim();
    } catch {
        // `pnpm whoami` exits non-zero when there are no credentials for the
        // registry, so treat any failure as "not logged in".
    }

    if (!username) {
        throw new Error(
            "You are not logged in to npm. Run `pnpm login` to log in, then try again.",
        );
    }

    console.log(`✓ Logged in to npm as ${username}`);

    return username;
}

/**
 * Log out of npm.
 *
 * We don't want to leave a login session lying around once we're done with it.
 *
 * This is best-effort; there's nothing left for us to do by this point, so a
 * failure to log out isn't worth failing the whole operation over.
 */
export function logoutOfNpm(): void {
    try {
        execSync("pnpm logout", {stdio: "ignore"});
        console.log("✓ Logged out of npm");
    } catch {
        console.warn(
            "⚠ Could not log out of npm. Please run `pnpm logout` yourself.",
        );
    }
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
