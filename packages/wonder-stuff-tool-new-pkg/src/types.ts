/**
 * The parsed arguments from the command line.
 */
export interface ParsedArgs {
    /** The name of the npm package to create a placeholder for. */
    packageName: string;
    /** Whether to clean up the temporary directory after publishing. */
    cleanup: boolean;
}
