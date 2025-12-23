import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import crypto from "node:crypto";
import {execSync} from "node:child_process";
import {detectGitRepoOriginUrl, parseRepoInfo} from "../git";

describe("git", () => {
    const tempDirs: string[] = [];

    /**
     * Creates a temporary git repository with the given remoteUrl as the
     * repo's origin. Automatically registers the git repo dir for cleanup
     * after the test is complete.
     */
    function makeGitRepoWithRemote(remoteUrl: string) {
        const tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), `test-git-repo-${crypto.randomUUID()}`),
        );
        tempDirs.push(tempDir);

        execSync("git init", {cwd: tempDir});
        execSync(`git remote add origin "${remoteUrl}"`, {cwd: tempDir});
        
        return tempDir;
    }

    afterEach(() => {
        const dirsToDelete = tempDirs.splice(0, tempDirs.length);
        dirsToDelete.forEach((dir) => fs.rmSync(dir, {recursive: true}));
    });

    describe("#detectGitRepo", () => {
        it("should return the git remote URL when successful", () => {
            // Arrange
            const expectedUrl = "git@github.com:Khan/wonder-stuff.git";
            const repoDir = makeGitRepoWithRemote(expectedUrl);

            // Act
            const result = detectGitRepoOriginUrl(repoDir);

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it("should trim whitespace from the git remote URL", () => {
            // Arrange
            const expectedUrl = "https://github.com/Khan/wonder-stuff.git";
            const repoDir = makeGitRepoWithRemote(`  ${expectedUrl}  `);

            // Act
            const result = detectGitRepoOriginUrl(repoDir);

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it("should throw an error when git command fails", () => {
            // Arrange
            const nonExistantWorkingDir = path.join(
                os.tmpdir(),
                `test-git-repo-${crypto.randomUUID()}`,
            );

            // Act
            const act = () => detectGitRepoOriginUrl(nonExistantWorkingDir);

            // Assert
            expect(act).toThrow("ENOENT");
        });

        it("should throw an error when not in a git repository", () => {
            // Arrange
            const repoDir = fs.mkdtempSync(
                path.join(os.tmpdir(), `test-git-repo-${crypto.randomUUID()}`),
            );

            // Act
            const act = () => detectGitRepoOriginUrl(repoDir);

            // Assert
            expect(act).toThrow("not a git repository");
        });
    });

    describe("#parseRepoInfo", () => {
        it("should parse SSH format git URL", () => {
            // Arrange
            const url = "git@github.com:Khan/wonder-stuff.git";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("Khan/wonder-stuff");
        });

        it("should parse HTTPS format git URL", () => {
            // Arrange
            const url = "https://github.com/Khan/wonder-stuff.git";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("Khan/wonder-stuff");
        });

        it("should parse git+https format git URL", () => {
            // Arrange
            const url = "git+https://github.com/Khan/wonder-stuff.git";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("Khan/wonder-stuff");
        });

        it("should parse git URL without .git suffix", () => {
            // Arrange
            const url = "https://github.com/Khan/wonder-stuff";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("Khan/wonder-stuff");
        });

        it("should parse SSH URL without .git suffix", () => {
            // Arrange
            const url = "git@github.com:Khan/wonder-stuff";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("Khan/wonder-stuff");
        });

        it("should handle repository names with hyphens", () => {
            // Arrange
            const url = "https://github.com/my-org/my-awesome-repo.git";

            // Act
            const result = parseRepoInfo(url);

            // Assert
            expect(result).toBe("my-org/my-awesome-repo");
        });

        it("should throw an error for invalid URL format", () => {
            // Arrange
            const url = "invalid-url";

            // Act
            const act = () => parseRepoInfo(url);

            // Assert
            expect(act).toThrow(
                "Could not parse repository info from URL: invalid-url",
            );
        });

        it("should throw an error for non-GitHub URL", () => {
            // Arrange
            const url = "https://gitlab.com/Khan/wonder-stuff.git";

            // Act
            const act = () => parseRepoInfo(url);

            // Assert
            expect(act).toThrow(
                "Could not parse repository info from URL: https://gitlab.com/Khan/wonder-stuff.git",
            );
        });

        it("should throw an error for malformed GitHub URL", () => {
            // Arrange
            const url = "https://github.com/Khan";

            // Act
            const act = () => parseRepoInfo(url);

            // Assert
            expect(act).toThrow(
                "Could not parse repository info from URL: https://github.com/Khan",
            );
        });

        it("should throw an error for empty URL", () => {
            // Arrange
            const url = "";

            // Act
            const act = () => parseRepoInfo(url);

            // Assert
            expect(act).toThrow("Could not parse repository info from URL: ");
        });
    });
});
