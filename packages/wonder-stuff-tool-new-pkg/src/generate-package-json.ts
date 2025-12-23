/**
 * Generate the placeholder package's `package.json` file contents.
 */
export function generatePackageJson(
    packageName: string,
    repoName: string,
): string {
    const packageJson = {
        name: packageName,
        description: "Placeholder to allow Trusted Publishing configuration",
        author: "Khan Academy",
        license: "MIT",
        version: "0.0.1",
        publishConfig: {
            access: "public",
        },
        repository: {
            type: "git",
            // This is the format that `npm pkg fix` writes.
            url: `git+https://github.com/${repoName}.git`,
        },
        bugs: {
            url: `https://github.com/${repoName}/issues`,
        },
        module: "index.js",
        main: "index.js",
    };

    return JSON.stringify(packageJson, null, 4) + "\n";
}
