/**
 * Print the next steps to take after publish.
 * 
 * Prints the next steps to take after the placeholder package has been
 * published.
 */
export function printNextSteps(packageName: string): void {
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
