// @flow
import * as Express from "express";
import * as RootLogger from "../root-logger.js";
import * as DefaultRequestLogging from "../middleware/default-request-logging.js";
import * as DefaultErrorLogging from "../middleware/default-error-logging.js";
// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "../types.js";

import {startServer} from "../start-server.js";

jest.mock("heapdump");
jest.mock("../root-logger.js");
jest.mock("express");
jest.mock("../middleware/default-error-logging.js");
jest.mock("../middleware/default-request-logging.js");

describe("#start-server", () => {
    beforeEach(() => {
        jest.spyOn(process, "on").mockImplementation(() => {});
    });

    it("should set the root logger to the given logger", async () => {
        // Arrange
        const logger: $FlowFixMe = {
            debug: jest.fn(),
        };
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger,
            mode: Runtime.Test,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        const setRootLoggerSpy = jest.spyOn(RootLogger, "setRootLogger");

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(setRootLoggerSpy).toHaveBeenCalledWith(logger);
    });

    it.each(Array.from(Runtime.members()))(
        "should import heapdumps if allowHeapDumps is true",
        async (mode) => {
            // Arrange
            const logger: $FlowFixMe = {
                debug: jest.fn(),
            };
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger,
                mode,
                allowHeapDumps: true,
            };
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                keepAliveTimeout: 0,
            };
            const pretendApp: $FlowFixMe = {
                listen: jest.fn().mockReturnValue(fakeServer),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

            // Act
            await startServer(options, pretendApp);

            // Assert
            expect(logger.debug).toHaveBeenCalledWith(
                expect.stringContaining(
                    'Heapdumps enabled. To create a heap snapshot at any time, run "kill -USR2 ',
                ),
            );
        },
    );

    it("should import heapdumps if not production", async () => {
        // Arrange
        const logger: $FlowFixMe = {
            debug: jest.fn(),
        };
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger,
            mode: Runtime.Development,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(logger.debug).toHaveBeenCalledWith(
            expect.stringContaining(
                'Heapdumps enabled. To create a heap snapshot at any time, run "kill -USR2 ',
            ),
        );
    });

    it("should not import heapdumps if in production", async () => {
        // Arrange
        const logger: $FlowFixMe = {
            debug: jest.fn(),
        };
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger,
            mode: Runtime.Production,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should not import heapdumps if explicitly told not to", async () => {
        // Arrange
        const logger: $FlowFixMe = {
            debug: jest.fn(),
        };
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger,
            mode: Runtime.Development,
            allowHeapDumps: false,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should add request middleware", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
        jest.spyOn(
            DefaultRequestLogging,
            "defaultRequestLogging",
        ).mockReturnValue("FAKE_REQUEST_MIDDLEWARE");

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(pretendApp.use).toHaveBeenCalledWith("FAKE_REQUEST_MIDDLEWARE");
    });

    it("should not add request middleware if asked not to", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
            includeRequestMiddleware: false,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
        jest.spyOn(
            DefaultRequestLogging,
            "defaultRequestLogging",
        ).mockReturnValue("FAKE_REQUEST_MIDDLEWARE");

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(pretendApp.use).not.toHaveBeenCalledWith(
            "FAKE_REQUEST_MIDDLEWARE",
        );
    });

    it("should add error middleware", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
        jest.spyOn(DefaultErrorLogging, "defaultErrorLogging").mockReturnValue(
            "FAKE_ERROR_MIDDLEWARE",
        );

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(pretendApp.use).toHaveBeenCalledWith("FAKE_ERROR_MIDDLEWARE");
    });

    it("should not add error middleware if asked not to", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
            includeErrorMiddleware: false,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
        jest.spyOn(DefaultErrorLogging, "defaultErrorLogging").mockReturnValue(
            "FAKE_ERROR_MIDDLEWARE",
        );

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(pretendApp.use).not.toHaveBeenCalledWith(
            "FAKE_ERROR_MIDDLEWARE",
        );
    });

    it("should listen on the configured port", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(pretendApp.listen).toHaveBeenCalledWith(
            42,
            "127.0.0.1",
            expect.any(Function),
        );
    });

    it("should listen for connections", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        const fakeServer = {
            address: () => ({
                address: "ADDRESS",
                port: "PORT",
            }),
            on: jest.fn(),
        };
        const listenMock = jest.fn().mockReturnValue(fakeServer);
        const pretendApp: $FlowFixMe = {
            listen: listenMock,
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(fakeServer.on).toHaveBeenCalledWith(
            "connection",
            expect.any(Function),
        );
    });

    it("should listen for connections closing", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        let connectionHandler;
        const fakeServer = {
            address: () => ({
                address: "ADDRESS",
                port: "PORT",
            }),
            on: jest.fn().mockImplementation((event, fn) => {
                if (event === "connection") {
                    connectionHandler = fn;
                }
            }),
        };
        const fakeConnection = {
            remoteAddress: "CONNECTION_ADDRESS",
            remotePort: "CONNECTION_PORT",
            on: jest.fn(),
        };
        const listenMock = jest.fn().mockReturnValue(fakeServer);
        const pretendApp: $FlowFixMe = {
            listen: listenMock,
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockReturnValue(pretendApp);
        await startServer(options, pretendApp);

        // Act
        connectionHandler?.(fakeConnection);

        // Assert
        expect(fakeConnection.on).toHaveBeenCalledWith(
            "close",
            expect.any(Function),
        );
    });

    it("should set the keepAliveTimeout on the created server to the value in the options when provided", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
            keepAliveTimeout: 42,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

        // Act
        await startServer(options, pretendApp);
        const result = fakeServer.keepAliveTimeout;

        // Assert
        expect(result).toBe(42);
    });

    it("should set the keepAliveTimeout on the created server to 90000 when no value given", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: ({
                debug: jest.fn(),
            }: $FlowFixMe),
            mode: Runtime.Test,
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        };
        const pretendApp: $FlowFixMe = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

        // Act
        await startServer(options, pretendApp);
        const result = fakeServer.keepAliveTimeout;

        // Assert
        expect(result).toBe(90000);
    });

    it.each`
        keepAliveTimeout | headersTimeout
        ${null}          | ${95000}
        ${42}            | ${5042}
    `(
        "should set headersTimeout to $headersTimeout when keepAliveTimeout is $keepAliveTimeout",
        async ({keepAliveTimeout, headersTimeout}) => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    debug: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
                keepAliveTimeout,
            };
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                keepAliveTimeout: 0,
                headersTimeout: 0,
            };
            const pretendApp: $FlowFixMe = {
                listen: jest.fn().mockReturnValue(fakeServer),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockImplementation(() => pretendApp);

            // Act
            await startServer(options, pretendApp);
            const result = fakeServer.headersTimeout;

            // Assert
            expect(result).toBe(headersTimeout);
        },
    );

    describe("listen callback", () => {
        it("should report start failure if gateway is null", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    debug: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: Unknown error",
                {kind: "Internal"},
            );
        });

        it("should report start failure if there's an error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback(new Error("BOOM ????"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: BOOM ????",
                {kind: "Internal"},
            );
        });

        it.each([[null, undefined, "ADDRESS"]])(
            "should report start failure if address is %s",
            async (address) => {
                // Arrange
                const options = {
                    name: "TEST_GATEWAY",
                    port: 42,
                    host: "127.0.0.1",
                    logger: ({
                        warn: jest.fn(),
                    }: $FlowFixMe),
                    mode: Runtime.Test,
                };
                const fakeServer = {
                    address: () => address,
                    on: jest.fn(),
                };
                const listenMock = jest.fn().mockReturnValue(fakeServer);
                const pretendApp: $FlowFixMe = {
                    listen: listenMock,
                    use: jest.fn().mockReturnThis(),
                };
                jest.spyOn(Express, "default").mockReturnValue(pretendApp);
                await startServer(options, pretendApp);
                const warnSpy = jest.spyOn(options.logger, "warn");
                const listenCallback = listenMock.mock.calls[0][2];

                // Act
                listenCallback();

                // Assert
                expect(warnSpy).toHaveBeenCalledWith(
                    `TEST_GATEWAY may not have started properly: ${address}`,
                );
            },
        );

        it("should report a successful start", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            await startServer(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY running at http://ADDRESS:PORT",
            );
        });
    });

    describe("close on SIGINT", () => {
        it("should do nothing if the gateway doesn't exist", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processSpy = jest.spyOn(process, "on");
            await startServer(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const processCallback = processSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(infoSpy).not.toHaveBeenCalled();
        });

        it("should attempt to close the server on SIGINT", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processSpy = jest.spyOn(process, "on");
            await startServer(options, pretendApp);
            const infoSpy = jest.spyOn(options.logger, "info");
            const processCallback = processSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(infoSpy).toHaveBeenCalledWith(
                "SIGINT received, shutting down server.",
            );
            expect(fakeServer.close).toHaveBeenCalled();
        });

        it("should handle errors from closing the server", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];
            processCallback();
            const closeCallback = fakeServer.close.mock.calls[0][0];

            // Act
            closeCallback(new Error("ERROR"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error shutting down server: ERROR",
                {
                    kind: "Internal",
                },
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should default error message when closing the server and the error message is null", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            }: $FlowFixMe);
            jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];
            processCallback();
            const closeCallback = fakeServer.close.mock.calls[0][0];

            // Act
            closeCallback({});

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error shutting down server: Unknown Error",
                {
                    kind: "Internal",
                },
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should close gracefully if there is no error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];
            processCallback();
            const closeCallback = fakeServer.close.mock.calls[0][0];

            // Act
            closeCallback();

            // Assert
            expect(errorSpy).not.toHaveBeenCalled();
            expect(processExitSpy).toHaveBeenCalledWith(0);
        });

        it("should handle .close() throwing an error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn().mockImplementation(() => {
                    throw new Error("CLOSE ERROR");
                }),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error closing server: CLOSE ERROR",
                {
                    kind: "Internal",
                },
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should handle .close() throwing null", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn().mockImplementation(() => {
                    // eslint-disable-next-line no-throw-literal
                    throw null;
                }),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            }: $FlowFixMe);
            jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error closing server: Unknown Error",
                {
                    kind: "Internal",
                },
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should handle .close() throwing error with no message", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                    error: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                close: jest.fn().mockImplementation(() => {
                    // eslint-disable-next-line no-throw-literal
                    throw {};
                }),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            }: $FlowFixMe);
            jest.spyOn(Express, "default").mockImplementation(() => pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startServer(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error closing server: Unknown Error",
                {
                    kind: "Internal",
                },
            );
            expect(processExitSpy).toHaveBeenCalledWith(1);
        });

        it("should destroy only open connections on close", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: ({
                    info: jest.fn(),
                }: $FlowFixMe),
                mode: Runtime.Test,
            };
            let connectionHandler;
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn().mockImplementation((event, fn) => {
                    if (event === "connection") {
                        connectionHandler = fn;
                    }
                }),
                close: jest.fn(),
            };
            const fakeConnection1 = {
                remoteAddress: "CONNECTION_ADDRESS1",
                remotePort: "CONNECTION_PORT1",
                on: jest.fn(),
                destroy: jest.fn(),
            };
            const fakeConnection2 = {
                remoteAddress: "CONNECTION_ADDRESS2",
                remotePort: "CONNECTION_PORT2",
                on: jest.fn(),
                destroy: jest.fn(),
            };
            const fakeConnection3 = {
                remoteAddress: "CONNECTION_ADDRESS3",
                remotePort: "CONNECTION_PORT3",
                on: jest.fn(),
                destroy: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: $FlowFixMe = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "default").mockReturnValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            await startServer(options, pretendApp);
            const sigintCallback = processOnSpy.mock.calls[0][1];

            // Act
            // Register some connections
            connectionHandler?.(fakeConnection1);
            connectionHandler?.(fakeConnection2);
            connectionHandler?.(fakeConnection3);
            // "close" one by firing the handler registered with its "close"
            // event
            fakeConnection2.on.mock.calls[0][1]();
            // Now pretend we got the SIGINT signal.
            sigintCallback();

            // Assert
            expect(fakeConnection1.destroy).toHaveBeenCalled();
            expect(fakeConnection3.destroy).toHaveBeenCalled();

            // This shouldn't be called because it was closed.
            expect(fakeConnection2.destroy).not.toHaveBeenCalled();
        });
    });
});
