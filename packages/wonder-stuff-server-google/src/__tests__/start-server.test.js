// @flow
import {startServer} from "../start-server.js";
import {createLogger} from "../create-logger.js";

jest.mock("../root-logger.js");

describe("#start-server", () => {
    beforeEach(() => {
        jest.spyOn(process, "on").mockImplementation(() => {});
    });

    const GAE_SERVICE = process.env.GAE_SERVICE;
    afterEach(() => {
        if (process.env.GAE_SERVICE == null) {
            delete process.env.GAE_SERVICE;
        } else {
            process.env.GAE_SERVICE = GAE_SERVICE;
        }
    });

    it("should set GAE_SERVICE if it is not set", async () => {
        // Arrange
        delete process.env.GAE_SERVICE;
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("TEST_GATEWAY");
    });

    it("should not set GAE_SERVICE if it is already set", async () => {
        // Arrange
        process.env.GAE_SERVICE = "GAE_SERVICE_NAME";
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("GAE_SERVICE_NAME");
    });

    it("should setup stackdriver", async () => {
        // Arrange
        const options = {
            cloudOptions: {
                debugAgent: false,
                profiler: false,
            },
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));
        const setupStackdriverSpy = jest
            .spyOn(SetupStackdriver, "setupStackdriver")
            .mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(setupStackdriverSpy).toHaveBeenCalledWith(
            "test",
            options.cloudOptions,
        );
    });

    it("should add GAE middleware", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        const useAppEngineMiddlewareSpy = jest
            .spyOn(UseAppEngineMiddleware, "useAppEngineMiddleware")
            .mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

        // Assert
        expect(useAppEngineMiddlewareSpy).toHaveBeenCalledWith(
            pretendApp,
            "test",
            options.logger,
        );
    });

    it("should listen on the configured port", async () => {
        // Arrange
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const pretendApp = ({
            listen: jest.fn(),
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

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
            logger: createLogger("test", "debug"),
            mode: "test",
        };
        const fakeServer = {
            address: () => ({
                address: "ADDRESS",
                port: "PORT",
            }),
            on: jest.fn(),
        };
        const listenMock = jest.fn().mockReturnValue(fakeServer);
        const pretendApp = ({
            listen: listenMock,
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startGateway(options, pretendApp);

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
            logger: createLogger("test", "debug"),
            mode: "test",
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
        const pretendApp = ({
            listen: listenMock,
        }: any);
        jest.spyOn(
            UseAppEngineMiddleware,
            "useAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));
        await startGateway(options, pretendApp);

        // Act
        connectionHandler?.(fakeConnection);

        // Assert
        expect(fakeConnection.on).toHaveBeenCalledWith(
            "close",
            expect.any(Function),
        );
    });

    describe("listen callback", () => {
        it("should report start failure if gateway is null", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const listenCallback = listenMock.mock.calls[0][2];

            // Act
            listenCallback(new Error("BOOM 🧨"));

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "TEST_GATEWAY appears not to have started: BOOM 🧨",
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
                    logger: createLogger("test", "debug"),
                    mode: "test",
                };
                const fakeServer = {
                    address: () => address,
                    on: jest.fn(),
                };
                const listenMock = jest.fn().mockReturnValue(fakeServer);
                const pretendApp = ({
                    listen: listenMock,
                }: any);
                jest.spyOn(
                    UseAppEngineMiddleware,
                    "useAppEngineMiddleware",
                ).mockReturnValue(Promise.resolve(pretendApp));
                await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
            };
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
            };
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processSpy = jest.spyOn(process, "on");
            await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
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
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processSpy = jest.spyOn(process, "on");
            await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
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
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
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

        it("should close gracefully if there is no error", async () => {
            // Arrange
            const options = {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: createLogger("test", "debug"),
                mode: "test",
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
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
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
                logger: createLogger("test", "debug"),
                mode: "test",
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
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue();
            await startGateway(options, pretendApp);
            const errorSpy = jest.spyOn(options.logger, "error");
            const processCallback = processOnSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(errorSpy).toHaveBeenCalledWith(
                "Error closing gateway: CLOSE ERROR",
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
                logger: createLogger("test", "debug"),
                mode: "test",
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
            const pretendApp = ({
                listen: listenMock,
            }: any);
            jest.spyOn(
                UseAppEngineMiddleware,
                "useAppEngineMiddleware",
            ).mockReturnValue(Promise.resolve(pretendApp));
            const processOnSpy = jest.spyOn(process, "on");
            await startGateway(options, pretendApp);
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
