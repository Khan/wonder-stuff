import path from "node:path";
import os from "node:os";
import {mkdtemp, rm} from "node:fs/promises";

export async function createTempDirectory(): Promise<string> {
    const prefix = path.join(os.tmpdir(), "npm-placeholder-");
    const tempDir = await mkdtemp(prefix);
    console.log(`✓ Created temporary directory: ${tempDir}`);
    return tempDir;
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
