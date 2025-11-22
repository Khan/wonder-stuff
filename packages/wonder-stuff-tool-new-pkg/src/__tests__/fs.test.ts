import path from "node:path";
import os from "node:os";
import fs from "node:fs";

import {createTempDirectory, cleanupTempDirectory} from "../fs";

describe("fs", () => {
    describe("#createTempDirectory", () => {
        it("should create a directory with the correct prefix", async () => {
            // Arrange
            const expectedPrefix = path.join(os.tmpdir(), "npm-placeholder-");

            // Act
            const result = await createTempDirectory();

            // Assert
            expect(result).toStartWith(expectedPrefix);
        });

        it("should return a unique directory path", async () => {
            // Arrange

            // Act
            const result1 = await createTempDirectory();
            const result2 = await createTempDirectory();

            // Assert
            expect(result1).not.toEqual(result2);
        });
    });

    describe("#cleanupTempDirectory", () => {
        it("should remove the directory when it exists", async () => {
            // Arrange
            const tempDir = fs.mkdtempSync(
                path.join(os.tmpdir(), `test-${crypto.randomUUID()}`),
            );

            // Act
            await cleanupTempDirectory(tempDir);

            // Assert
            expect(fs.existsSync(tempDir)).toBe(false);
        });

        it("should not throw when directory does not exist", async () => {
            // Arrange
            const tempDir = path.join(
                os.tmpdir(),
                `nonexistent-${crypto.randomUUID()}`,
            );

            // Act
            const result = cleanupTempDirectory(tempDir);

            // Assert
            await expect(result).resolves.not.toThrow();
        });

        it("should do nothing when tempDir is null", async () => {
            // Arrange
            const rmSpy = jest.spyOn(require("node:fs/promises"), "rm");

            // Act
            await cleanupTempDirectory(null);

            // Assert
            expect(rmSpy).not.toHaveBeenCalled();
        });

        it("should silently handle errors during cleanup", async () => {
            // Arrange
            jest.spyOn(require("node:fs/promises"), "rm").mockRejectedValue(
                new Error("Permission denied"),
            );

            // Act
            const act = async () => {
                await cleanupTempDirectory("/tmp/error-dir");
            };

            // Assert
            expect(act).not.toThrow();
        });
    });
});
