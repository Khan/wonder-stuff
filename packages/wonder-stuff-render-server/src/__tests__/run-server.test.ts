import {secret} from "@khanacademy/wonder-stuff-core";
import * as Express from "express";
import * as ExpressAsyncHandler from "express-async-handler";
import * as WSServer from "@khanacademy/wonder-stuff-server";
import * as MakeRenderHandler from "../handlers/make-render-handler";
import * as GetRequestAuthentication from "../get-request-authentication";

import {runServer} from "../run-server";
import type {AuthenticationOptions} from "../types";

jest.mock("express");
jest.mock("express-async-handler");
jest.mock("@khanacademy/wonder-stuff-server");
jest.mock("../handlers/make-render-handler");
jest.mock("../get-request-authentication");

describe("#runServer", () => {
    describe("when NODE_ENV does not match the runtime mode", () => {
        const OLD_NODE_ENV = process.env.NODE_ENV;
        const OLD_KA_IS_DEV_SERVER = process.env.KA_IS_DEV_SERVER;

        beforeEach(() => {
            delete process.env.KA_IS_DEV_SERVER;
            jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
                "something-else" as any,
            );
        });

        afterEach(() => {
            if (OLD_NODE_ENV == null) {
                delete process.env.NODE_ENV;
            } else {
                process.env.NODE_ENV = OLD_NODE_ENV;
            }

            if (OLD_KA_IS_DEV_SERVER == null) {
                delete process.env.KA_IS_DEV_SERVER;
            } else {
                process.env.KA_IS_DEV_SERVER = OLD_KA_IS_DEV_SERVER;
            }
        });

        it("should set NODE_ENV to `production` when KA_IS_DEV_SERVER is not 1", () => {
            // Arrange
            const pretendLogger = {} as any;
            const fakeRenderEnvironment: any = {
                render: jest.fn(),
            };
            jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
            jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
            const pretendApp = {
                use: jest.fn().mockReturnThis(),
                get: jest.fn().mockReturnThis(),
                set: jest.fn(),
            } as any;
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);

            // Act
            runServer({
                name: "MY_TEST",
                port: 42,
                host: "127.0.0.1",
                renderEnvironment: fakeRenderEnvironment,
            });

            // Assert
            expect(process.env.NODE_ENV).toBe("production");
        });

        it("should set NODE_ENV to `development` when KA_IS_DEV_SERVER is 1", () => {
            // Arrange
            process.env.KA_IS_DEV_SERVER = "1";
            const pretendLogger = {} as any;
            const fakeRenderEnvironment: any = {
                render: jest.fn(),
            };
            jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
            jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
            const pretendApp = {
                use: jest.fn().mockReturnThis(),
                get: jest.fn().mockReturnThis(),
                set: jest.fn(),
            } as any;
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);

            // Act
            runServer({
                name: "MY_TEST",
                port: 42,
                host: "127.0.0.1",
                renderEnvironment: fakeRenderEnvironment,
            });

            // Assert
            expect(process.env.NODE_ENV).toBe("development");
        });
    });

    it("should create an express app", async () => {
        // Arrange
        const pretendLogger = {} as any;
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Test,
        );
        jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
        const pretendApp = {
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        } as any;
        const expressSpy = jest
            .spyOn(Express, "default")
            .mockReturnValue(pretendApp);

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
        });

        // Assert
        expect(expressSpy).toHaveBeenCalledTimes(1);
    });

    it("should add the render handler wrapped by express-async-handler", async () => {
        // Arrange
        const pretendLogger = {} as any;
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Test,
        );
        jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
        const pretendApp = {
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        } as any;
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        /**
         * To check that the render handler is what gets wrapped, we're going
         * to mock one to just be a function that returns a string, and then
         * mock the wrapper to return a version of that string. Then we can
         * confirm that they were combined for our test expectation.
         */
        jest.spyOn(MakeRenderHandler, "makeRenderHandler").mockReturnValue(
            () => "RENDER_HANDLER",
        );
        jest.spyOn(ExpressAsyncHandler, "default").mockImplementation(
            (pretendFn: any) => `ASYNC_HANDLER:${pretendFn()}` as any,
        );

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
        });

        // Assert
        expect(pretendApp.get).toHaveBeenCalledWith(
            "/_render",
            "ASYNC_HANDLER:RENDER_HANDLER",
        );
    });

    it("should get the authentication details", async () => {
        // Arrange
        const pretendLogger = {} as any;
        const fakeRenderEnvironment: any = {
            render: jest.fn(),
        };
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Test,
        );
        jest.spyOn(WSServer, "getLogger").mockReturnValue(pretendLogger);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
        const pretendApp = {
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        } as any;
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const getRequestAuthenticationSpy = jest.spyOn(
            GetRequestAuthentication,
            "getRequestAuthentication",
        );
        const authOptions: AuthenticationOptions = {
            cryptoKeyPath: "CRYPTO_KEY_PATH",
            headerName: "HEADER_NAME",
            secretKey: "SECRET_KEY",
        };

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
            authentication: authOptions,
        });

        // Assert
        expect(getRequestAuthenticationSpy).toHaveBeenCalledWith(authOptions);
    });

    it("should start the gateway", async () => {
        // Arrange
        const fakeRenderEnvironment: any = {render: jest.fn()};
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Test,
        );
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);
        const pretendApp = {
            use: jest.fn().mockReturnThis(),
            get: jest.fn().mockReturnThis(),
            set: jest.fn(),
        } as any;
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        jest.spyOn(
            GetRequestAuthentication,
            "getRequestAuthentication",
        ).mockResolvedValue({
            headerName: "HEADER_NAME",
            secret: secret("SECRET_VALUE"),
        });
        const startGatewaySpy = jest.spyOn(WSServer, "startServer");

        // Act
        await runServer({
            name: "MY_TEST",
            port: 42,
            host: "127.0.0.1",
            renderEnvironment: fakeRenderEnvironment,
            authentication: {
                cryptoKeyPath: "CRYPTO_KEY_PATH",
                headerName: "HEADER_NAME",
                secretKey: "SECRET_KEY",
            },
            cloudOptions: {
                profiler: true,
            },
        });

        // Assert
        expect(startGatewaySpy).toHaveBeenCalledWith(
            {
                name: "MY_TEST",
                port: 42,
                host: "127.0.0.1",
                mode: "test",
                integrations: {
                    profiler: true,
                },
                logLevel: "debug",
                requestAuthentication: {
                    headerName: "HEADER_NAME",
                    secret: "SECRET_VALUE",
                },
            },
            pretendApp,
        );
    });
});
