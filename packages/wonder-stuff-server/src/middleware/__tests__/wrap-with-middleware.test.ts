import * as Express from "express";
import * as LoggingWinston from "@google-cloud/logging-winston";
import {Runtime} from "../../types";

import * as AttachAppEngineRequestID from "../attach-app-engine-request-id";
import * as CommonServiceRoutes from "../common-service-routes";
import * as DefaultErrorLogging from "../default-error-logging";
import * as DefaultRequestLogging from "../default-request-logging";
import * as LogRequestInfo from "../log-request-info";
import * as RequestAuthentication from "../request-authentication";
import {wrapWithMiddleware} from "../wrap-with-middleware";

jest.mock("express");
jest.mock("@google-cloud/logging-winston");
jest.mock("../attach-app-engine-request-id");
jest.mock("../common-service-routes");
jest.mock("../default-error-logging");
jest.mock("../default-request-logging");
jest.mock("../log-request-info");
jest.mock("../request-authentication");

describe("#wrapWithMiddleware", () => {
    const requestAuthentication: any = "REQUEST_AUTHENTICATION";
    const logger: any = "LOGGER";
    const app: any = "APP_TO_WRAP";

    it("should create an express instance", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        const expressSpy = jest
            .spyOn(Express, "default")
            .mockReturnValue(pretendApp);

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(expressSpy).toHaveBeenCalled();
    });

    it("should add the attach request ID middleware first", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        jest.spyOn(
            AttachAppEngineRequestID,
            "attachAppEngineRequestID",
        ).mockReturnValue("ATTACH_REQUEST_ID" as any);

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenNthCalledWith(1, "ATTACH_REQUEST_ID");
    });

    describe("when in production", () => {
        it("should add logging-winston middleware second", async () => {
            // Arrange
            const pretendApp: any = {
                listen: jest.fn(),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            jest.spyOn(
                LoggingWinston.express,
                "makeMiddleware",
            ).mockResolvedValue("LOGGING_MIDDLEWARE" as any);

            // Arrange
            await wrapWithMiddleware(
                app,
                logger,
                Runtime.Production,
                requestAuthentication,
            );

            // Assert
            expect(pretendApp.use).toHaveBeenNthCalledWith(
                2,
                "LOGGING_MIDDLEWARE",
            );
        });

        it("should not add default request logging middleware", async () => {
            // Arrange
            const pretendApp: any = {
                listen: jest.fn(),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const defaultRequestLoggingSpy = jest.spyOn(
                DefaultRequestLogging,
                "defaultRequestLogging",
            );

            // Arrange
            await wrapWithMiddleware(
                app,
                logger,
                Runtime.Production,
                requestAuthentication,
            );

            // Assert
            expect(defaultRequestLoggingSpy).not.toHaveBeenCalled();
        });
    });

    describe("when not in production", () => {
        it("should not add logging-winston middleware", async () => {
            // Arrange
            const pretendApp: any = {
                listen: jest.fn(),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const lwSpy = jest.spyOn(LoggingWinston.express, "makeMiddleware");

            // Arrange
            await wrapWithMiddleware(
                app,
                logger,
                Runtime.Development,
                requestAuthentication,
            );

            // Assert
            expect(lwSpy).not.toHaveBeenCalled();
        });

        it("should add default request logging middleware second", async () => {
            // Arrange
            const pretendApp: any = {
                listen: jest.fn(),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            jest.spyOn(
                DefaultRequestLogging,
                "defaultRequestLogging",
            ).mockReturnValue("DEFAULT_REQUEST_LOGGING" as any);

            // Arrange
            await wrapWithMiddleware(
                app,
                logger,
                Runtime.Development,
                requestAuthentication,
            );

            // Assert
            expect(pretendApp.use).toHaveBeenNthCalledWith(
                2,
                "DEFAULT_REQUEST_LOGGING",
            );
        });
    });

    it("should add common service routes middleware third", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        jest.spyOn(CommonServiceRoutes, "commonServiceRoutes").mockReturnValue(
            "COMMON_SERVICE_ROUTES" as any,
        );

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenNthCalledWith(
            3,
            "COMMON_SERVICE_ROUTES",
        );
    });

    it("should add request authentication middleware fourth", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        jest.spyOn(
            RequestAuthentication,
            "requestAuthentication",
        ).mockReturnValue("REQUEST_AUTHENTICATION" as any);

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenNthCalledWith(
            4,
            "REQUEST_AUTHENTICATION",
        );
    });

    it("should add log request info middleware fifth", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenNthCalledWith(
            5,
            LogRequestInfo.logRequestInfo,
        );
    });

    it("should add the wrapped app sixth", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenNthCalledWith(6, app);
    });

    it("should add default error logging middleware last", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        jest.spyOn(DefaultErrorLogging, "defaultErrorLogging").mockReturnValue(
            "ERROR_HANDLING" as any,
        );

        // Arrange
        await wrapWithMiddleware(
            app,
            logger,
            Runtime.Production,
            requestAuthentication,
        );

        // Assert
        expect(pretendApp.use).toHaveBeenLastCalledWith("ERROR_HANDLING");
    });
});
