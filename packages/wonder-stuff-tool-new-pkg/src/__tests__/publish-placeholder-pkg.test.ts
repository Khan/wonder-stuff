import {parseArgs} from "../parse-args";
import {createTempDirectory} from "../fs";
import {detectGitRepoOriginUrl, parseRepoInfo} from "../git";
import {verifyNpmLogin, publishPackage, logoutOfNpm} from "../npm";
import {publishPlaceholderPackage} from "../publish-placeholder-pkg";

jest.mock("../parse-args");
jest.mock("../fs");
jest.mock("../git");
jest.mock("../npm");
jest.mock("../write-package-files");
jest.mock("../print-next-steps");

describe("#publishPlaceholderPackage", () => {
    beforeEach(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
        // Without this, a failed run would end the test process.
        jest.spyOn(process, "exit").mockImplementation((() => {}) as never);

        jest.mocked(parseArgs).mockReturnValue({
            packageName: "@khanacademy/some-pkg",
            cleanup: true,
        });
        jest.mocked(verifyNpmLogin).mockReturnValue("some-npm-user");
        jest.mocked(createTempDirectory).mockResolvedValue("/tmp/placeholder");
        jest.mocked(detectGitRepoOriginUrl).mockReturnValue(
            "git@github.com:Khan/wonder-stuff.git",
        );
        jest.mocked(parseRepoInfo).mockReturnValue("Khan/wonder-stuff");
    });

    it("should log out of npm after publishing", async () => {
        // Arrange

        // Act
        await publishPlaceholderPackage();

        // Assert
        expect(logoutOfNpm).toHaveBeenCalled();
    });

    it("should log out of npm when publishing failed", async () => {
        // Arrange
        jest.mocked(publishPackage).mockImplementation(() => {
            throw new Error("pnpm publish failed");
        });

        // Act
        await publishPlaceholderPackage();

        // Assert
        expect(logoutOfNpm).toHaveBeenCalled();
    });

    it("should exit with a failure code when publishing failed", async () => {
        // Arrange
        jest.mocked(publishPackage).mockImplementation(() => {
            throw new Error("pnpm publish failed");
        });

        // Act
        await publishPlaceholderPackage();

        // Assert
        expect(process.exit).toHaveBeenCalledWith(1);
    });

    it("should not log out of npm when there was no login", async () => {
        // Arrange
        jest.mocked(verifyNpmLogin).mockImplementation(() => {
            throw new Error("You are not logged in to npm.");
        });

        // Act
        await publishPlaceholderPackage();

        // Assert
        expect(logoutOfNpm).not.toHaveBeenCalled();
    });

    it("should not publish when there was no login", async () => {
        // Arrange
        jest.mocked(verifyNpmLogin).mockImplementation(() => {
            throw new Error("You are not logged in to npm.");
        });

        // Act
        await publishPlaceholderPackage();

        // Assert
        expect(publishPackage).not.toHaveBeenCalled();
    });
});
