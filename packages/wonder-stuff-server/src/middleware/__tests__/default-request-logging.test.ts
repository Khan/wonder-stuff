import * as ExpressWinston from "express-winston";
import {defaultRequestLogging} from "../default-request-logging";

jest.mock("express-winston");

describe("#defaultRequestLogging", () => {
    it("should return express-winston middleware", async () => {
        // Arrange
        const pretendLogger = {} as any;
        const pretendExpressWinstonMiddleware = {} as any;
        jest.spyOn(ExpressWinston, "logger").mockReturnValue(
            pretendExpressWinstonMiddleware,
        );

        // Act
        const result = await defaultRequestLogging(pretendLogger);

        // Assert
        expect(result).toBe(pretendExpressWinstonMiddleware);
    });

    it("should create middleware with logger", async () => {
        // Arrange
        const pretendLogger = {} as any;
        const pretendExpressWinstonMiddleware = {} as any;
        const middlewareSpy = jest
            .spyOn(ExpressWinston, "logger")
            .mockReturnValue(pretendExpressWinstonMiddleware);

        // Act
        await defaultRequestLogging(pretendLogger);

        // Assert
        expect(middlewareSpy).toHaveBeenCalledWith(
            expect.objectContaining({
                winstonInstance: pretendLogger,
            }),
        );
    });
});
