import {mkdtemp, rm} from "node:fs/promises";

export function createTempDirectory(): Promise<string> {
    const prefix = "npm-placeholder-";
    return mkdtemp(prefix);
}

export async function cleanupTempDirectory(
    tempDir: string | null,
): Promise<void> {
    try {
        // Try to cleanup temp directory if it exists
        if (tempDir) {
            await rm(tempDir, {recursive: true, force: true});
            console.log(`✓ Cleaned up temporary directory: ${tempDir}`);
        }
    } catch (error) {
        // Ignore cleanup errors during error handling, since the OS will clean
        // it up automatically.
    }
}
