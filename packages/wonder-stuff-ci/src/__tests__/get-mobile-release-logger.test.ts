import {getMobileReleaseLogger} from "../get-mobile-release-logger";

describe("#getMobileReleaseLogger", () => {
    it("return the mobile release logger with correct default values", () => {
        // Act
        const result = getMobileReleaseLogger();

        // Assert
        expect(result).toBeTruthy();
        expect(result.level).toStrictEqual("info");
    });

    it("return the mobile release logger with dual writing to console", () => {
        // Arrange
        const defaultLogger = getMobileReleaseLogger();
        // Act
        const result = getMobileReleaseLogger({
            projectId: "mobile-365917",
            logName: "release-raccoon",
            logLevel: "error",
            enableConsoleLogs: true,
            labels: {test: "test"},
        });

        // Assert
        expect(result).toBeTruthy();
        expect(result.transports.length).toBeGreaterThan(
            defaultLogger.transports.length,
        );
        expect(result.level).toStrictEqual("error");
    });
});
