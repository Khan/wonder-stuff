import * as Express from "express";
import {Runtime} from "@khanacademy/wonder-stuff-server";
import * as LoggingWinston from "@google-cloud/logging-winston";
import * as MakeAppEngineRequestIDMiddleware from "../middleware/make-app-engine-request-id-middleware";
import {addAppEngineMiddleware} from "../add-app-engine-middleware";

jest.mock("express");
jest.mock("@google-cloud/logging-winston");

describe("#addAppEngineMiddleware", () => {
    it("should use the passed application", async () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendApp = ({} as any);
        const newApp = ({
            use: jest.fn().mockReturnThis(),
        } as any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        await addAppEngineMiddleware(pretendApp, Runtime.Test, pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendApp);
    });

    describe("in production", () => {
        it("should add the logging-winston middleware", async () => {
            // Arrange
            const pretendLogger = ({} as any);
            const pretendApp = ({} as any);
            const newApp = ({
                use: jest.fn().mockReturnThis(),
            } as any);
            jest.spyOn(Express, "default").mockReturnValue(newApp);
            jest.spyOn(
                LoggingWinston.express,
                "makeMiddleware",
// @ts-expect-error - TS2345 - Argument of type 'string' is not assignable to parameter of type 'Promise<(req: ServerRequest, res: ServerResponse<IncomingMessage>, next: Function) => void>'.
            ).mockReturnValue("FAKE_LW_EXPRESS");

            // Act
            await addAppEngineMiddleware(
                pretendApp,
                Runtime.Production,
                pretendLogger,
            );

            // Assert
            expect(newApp.use).toHaveBeenCalledWith("FAKE_LW_EXPRESS");
        });

        it("should pass the logger to logging-winston middleware", async () => {
            // Arrange
            const pretendLogger = ("FAKE_LOGGER" as any);
            const pretendApp = ({} as any);
            const newApp = ({
                use: jest.fn().mockReturnThis(),
            } as any);
            jest.spyOn(Express, "default").mockReturnValue(newApp);
            const lwSpy = jest
                .spyOn(LoggingWinston.express, "makeMiddleware")
// @ts-expect-error - TS2345 - Argument of type 'string' is not assignable to parameter of type 'Promise<(req: ServerRequest, res: ServerResponse<IncomingMessage>, next: Function) => void>'.
                .mockReturnValue("FAKE_LW_EXPRESS");

            // Act
            await addAppEngineMiddleware(
                pretendApp,
                Runtime.Production,
                pretendLogger,
            );

            // Assert
            expect(lwSpy).toHaveBeenCalledWith("FAKE_LOGGER");
        });
    });

    describe.each([Runtime.Test, Runtime.Development])("in %s", (mode: any) => {
        it("should not add the logging-winston middleware", async () => {
            // Arrange
            const pretendLogger = ({} as any);
            const pretendApp = ({} as any);
            const newApp = ({
                use: jest.fn().mockReturnThis(),
            } as any);
            jest.spyOn(Express, "default").mockReturnValue(newApp);
            const lwSpy = jest.spyOn(LoggingWinston.express, "makeMiddleware");

            // Act
            await addAppEngineMiddleware(pretendApp, mode, pretendLogger);

            // Assert
            expect(lwSpy).not.toHaveBeenCalled();
        });
    });

    it("should add requestID middleware", async () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendApp = ({} as any);
        const pretendMiddleware = ({} as any);
        const newApp = ({
            use: jest.fn().mockReturnThis(),
        } as any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        jest.spyOn(
            MakeAppEngineRequestIDMiddleware,
            "makeAppEngineRequestIDMiddleware",
        ).mockReturnValue(pretendMiddleware);

        // Act
        await addAppEngineMiddleware(pretendApp, Runtime.Test, pretendLogger);

        // Assert
        expect(newApp.use).toHaveBeenCalledWith(pretendMiddleware);
    });

    it("should pass logger to requestID middleware", async () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendApp = ({} as any);
        const pretendMiddleware = ({} as any);
        const newApp = ({
            use: jest.fn().mockReturnThis(),
        } as any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);
        const makeMiddlewareSpy = jest
            .spyOn(
                MakeAppEngineRequestIDMiddleware,
                "makeAppEngineRequestIDMiddleware",
            )
            .mockReturnValue(pretendMiddleware);

        // Act
        await addAppEngineMiddleware(pretendApp, Runtime.Test, pretendLogger);

        // Assert
        expect(makeMiddlewareSpy).toHaveBeenCalledWith(pretendLogger);
    });

    it("should return the updated application", async () => {
        // Arrange
        const pretendLogger = ({} as any);
        const pretendApp = ({} as any);
        const newApp = ({
            use: jest.fn().mockReturnThis(),
        } as any);
        jest.spyOn(Express, "default").mockReturnValue(newApp);

        // Act
        const result = await addAppEngineMiddleware(
            pretendApp,
            Runtime.Test,
            pretendLogger,
        );

        // Assert
        expect(result).toBe(newApp);
    });
});
