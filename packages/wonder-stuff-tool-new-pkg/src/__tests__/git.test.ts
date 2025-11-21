import {execSync} from "node:child_process";
import {detectGitRepo, parseRepoInfo} from "../git";

jest.mock("node:child_process");

const mockedExecSync = execSync as jest.MockedFunction<typeof execSync>;

describe("git", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("#detectGitRepo", () => {
        it("should return the git remote URL when successful", () => {
            // Arrange
            const expectedUrl = "git@github.com:Khan/wonder-stuff.git";
            mockedExecSync.mockReturnValue(Buffer.from(expectedUrl + "\n"));

            // Act
            const result = detectGitRepo();

            // Assert
            expect(result).toBe(expectedUrl);
            expect(mockedExecSync).toHaveBeenCalledWith(
                "git remote get-url origin",
                {
                    encoding: "utf-8",
                    stdio: ["pipe", "pipe", "pipe"],
                },
            );
        });

        it("should trim whitespace from the git remote URL", () => {
            // Arrange
            const expectedUrl = "https://github.com/Khan/wonder-stuff.git";
            mockedExecSync.mockReturnValue(Buffer.from(`  ${expectedUrl}  \n`));

            // Act
            const result = detectGitRepo();

            // Assert
            expect(result).toBe(expectedUrl);
        });

        it("should throw an error when git command fails", () => {
            // Arrange
            mockedExecSync.mockImplementation(() => {
                throw new Error("Command failed");
            });

            // Act
            const act = () => detectGitRepo();

            // Assert
            expect(act).toThrow(
                "Failed to detect git repository. Make sure you're in a git repository with a remote named 'origin'.",
            );
        });

        it("should throw an error when not in a git repository", () => {
            // Arrange
            mockedExecSync.mockImplementation(() => {
                throw new Error("fatal: not a git repository");
            });

            // Act
            const act = () => detectGitRepo();

            // Assert
            expect(act).toThrow(
                "Failed to detect git repository. Make sure you're in a git repository with a remote named 'origin'.",
            );
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
