import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {generatePackageJson} from "./generate-package-json";
import {generateReadme} from "./generate-readme-md";
import {generateIndexJs} from "./generate-index-js";

/**
 * Generate and write the placeholder package files.
 *
 * This generated and writes the placeholder package files using
 * the given dir as the package working directory.
 *
 * @param tempDir The package working directory.
 * @param packageName The package name.
 * @param repoName The repo name to use for the package.json.
 * @returns A promise that resolves when the package files are written.
 */
export async function writePackageFiles(
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
