import {execSync} from "node:child_process";
import {logoutOfNpm, verifyNpmLogin} from "../npm";

jest.mock("node:child_process");

describe("npm", () => {
    describe("#verifyNpmLogin", () => {
        it("should return the logged in npm username", () => {
            // Arrange
            jest.spyOn(console, "log").mockImplementation(() => {});
            jest.mocked(execSync).mockReturnValue("some-npm-user\n");

            // Act
            const result = verifyNpmLogin();

            // Assert
            expect(result).toBe("some-npm-user");
        });

        it("should throw with login instructions when `pnpm whoami` fails", () => {
            // Arrange
            jest.mocked(execSync).mockImplementation(() => {
                throw new Error("ENEEDAUTH");
            });

            // Act
            const underTest = () => verifyNpmLogin();

            // Assert
            expect(underTest).toThrow(
                "You are not logged in to npm. Run `pnpm login` to log in, then try again.",
            );
        });

        it("should throw when `pnpm whoami` succeeds without a username", () => {
            // Arrange
            jest.mocked(execSync).mockReturnValue("\n");

            // Act
            const underTest = () => verifyNpmLogin();

            // Assert
            expect(underTest).toThrow("You are not logged in to npm.");
        });
    });

    describe("#logoutOfNpm", () => {
        it("should report a successful logout", () => {
            // Arrange
            const logSpy = jest
                .spyOn(console, "log")
                .mockImplementation(() => {});
            jest.mocked(execSync).mockReturnValue("");

            // Act
            logoutOfNpm();

            // Assert
            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Logged out of npm"),
            );
        });

        it("should not throw when logging out fails", () => {
            // Arrange
            jest.spyOn(console, "warn").mockImplementation(() => {});
            jest.mocked(execSync).mockImplementation(() => {
                throw new Error("pnpm logout failed");
            });

            // Act
            const underTest = () => logoutOfNpm();

            // Assert
            expect(underTest).not.toThrow();
        });

        it("should warn when logging out fails", () => {
            // Arrange
            const warnSpy = jest
                .spyOn(console, "warn")
                .mockImplementation(() => {});
            jest.mocked(execSync).mockImplementation(() => {
                throw new Error("pnpm logout failed");
            });

            // Act
            logoutOfNpm();

            // Assert
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("Please run `pnpm logout` yourself"),
            );
        });
    });
});
