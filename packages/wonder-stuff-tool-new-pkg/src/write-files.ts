import {writeFile} from "node:fs/promises";
import {join} from "node:path";
import {
    generatePackageJson,
    generateReadme,
    generateIndexJs,
} from "./placeholder_package";

export async function writeFiles(
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
