import * as ExpressWinston from "express-winston";
import {defaultErrorLogging} from "../default-error-logging";

jest.mock("express-winston");

describe("#defaultErrorLogging", () => {
    it("should return express-winston error logger", () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendErrorMiddleware = ({} as any);
        jest.spyOn(ExpressWinston, "errorLogger").mockReturnValue(
            pretendErrorMiddleware,
        );

        // Act
        const result = defaultErrorLogging(pretendLogger);

        // Assert
        expect(result).toBe(pretendErrorMiddleware);
    });

    it("should pass given logger to express winston", () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendErrorMiddleware = ({} as any);
        const errorLoggerSpy = jest
            .spyOn(ExpressWinston, "errorLogger")
            .mockReturnValue(pretendErrorMiddleware);

        // Act
        defaultErrorLogging(pretendLogger);

        // Assert
        expect(errorLoggerSpy).toHaveBeenCalledWith({
            winstonInstance: pretendLogger,
            level: "error",
        });
    });
});
