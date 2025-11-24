/**
 * Generates the placeholder package's `package.json` file contents.
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

/**
 * Generates the placeholder package's README file contents.
 */
export function generateReadme(packageName: string): string {
    return `# ${packageName}

This package is being published as a placeholder for the \`${packageName}\`
library. This will enable us to configure Trusted Publishing (which can't be
enabled until the package has been published at least once).
`;
}

/**
 * Generates the placholder package's `index.js` file contents. The contents are
 * meant to be very obvious that the package is simply a placeholder and
 * contains no usable code.
 */
export function generateIndexJs(): string {
    return 'throw new Error("Not implemented");\n';
}
