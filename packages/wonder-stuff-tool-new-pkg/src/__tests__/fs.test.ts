import {vol} from "memfs";
import {createTempDirectory, cleanupTempDirectory} from "../fs";

// Mock the fs/promises module to use memfs
jest.mock("node:fs/promises", () => require("memfs").promises);

describe("fs", () => {
    beforeEach(() => {
        // Reset the in-memory filesystem before each test
        vol.reset();
    });

    afterEach(() => {
        // Clean up after each test
        vol.reset();
    });

    describe("#createTempDirectory", () => {
        it("should create a directory with the correct prefix", async () => {
            // Arrange
            // memfs doesn't have mkdtemp, so we need to mock it
            const mkdtempMock = jest
                .fn()
                .mockResolvedValue("/tmp/npm-placeholder-abc123");
            jest.spyOn(
                require("node:fs/promises"),
                "mkdtemp",
            ).mockImplementation(mkdtempMock);

            // Act
            const result = await createTempDirectory();

            // Assert
            expect(mkdtempMock).toHaveBeenCalledWith("npm-placeholder-");
            expect(result).toBe("/tmp/npm-placeholder-abc123");
        });

        it("should return a unique directory path", async () => {
            // Arrange
            const mkdtempMock = jest
                .fn()
                .mockResolvedValueOnce("/tmp/npm-placeholder-abc123")
                .mockResolvedValueOnce("/tmp/npm-placeholder-def456");
            jest.spyOn(
                require("node:fs/promises"),
                "mkdtemp",
            ).mockImplementation(mkdtempMock);

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
            const tempDir = "/tmp/test-dir";
            vol.fromJSON({
                [tempDir + "/file.txt"]: "content",
            });

            // Act
            await cleanupTempDirectory(tempDir);

            // Assert
            expect(vol.existsSync(tempDir)).toBe(false);
        });

        it("should not throw when directory does not exist", async () => {
            // Arrange
            const tempDir = "/tmp/nonexistent-dir";

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
            const tempDir = "/tmp/error-dir";
            const rmSpy = jest
                .spyOn(require("node:fs/promises"), "rm")
                .mockRejectedValue(new Error("Permission denied"));

            // Act
            const result = cleanupTempDirectory(tempDir);

            // Assert
            await expect(result).resolves.not.toThrow();
        });
    });
});
