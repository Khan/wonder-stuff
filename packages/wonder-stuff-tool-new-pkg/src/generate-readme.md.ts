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
