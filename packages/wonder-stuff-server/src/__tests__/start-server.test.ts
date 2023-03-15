import {secret} from "@khanacademy/wonder-stuff-core";
import * as RootLogger from "../root-logger";
import * as WrapWithMiddleware from "../middleware/wrap-with-middleware";
import * as CreateLogger from "../create-logger";
import {Runtime} from "../types";
import {startServer} from "../start-server";
import type {ServerOptions} from "../types";

jest.mock("heapdump");
jest.mock("../create-logger");
jest.mock("../root-logger");
jest.mock("../middleware/wrap-with-middleware");

describe("#start-server", () => {
    const DefaultOptions: ServerOptions = {
        name: "TEST_GATEWAY",
        port: 42,
        host: "127.0.0.1",
        mode: Runtime.Test,
        logLevel: "debug",
        requestAuthentication: {
            secret: secret("SECRET"),
            headerName: "X-Auth",
        },
    };

    beforeEach(() => {
        jest.spyOn(process, "on").mockImplementation((() => {}) as any);
    });

    it("should set the root logger to the given logger", async () => {
        // Arrange
        const logger: any = {
            debug: jest.fn(),
        };
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );
        const setRootLoggerSpy = jest.spyOn(RootLogger, "setRootLogger");

        // Act
        await startServer(DefaultOptions, pretendApp);

        // Assert
        expect(setRootLoggerSpy).toHaveBeenCalledWith(logger);
    });

    it.each(Array.from(Object.values(Runtime)))(
        "should import heapdumps if allowHeapDumps is true",
        async (mode: any) => {
            // Arrange
            const logger: any = {
                debug: jest.fn(),
            };
            const options: ServerOptions = {
                ...DefaultOptions,
                allowHeapDumps: true,
            };
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                keepAliveTimeout: 0,
            } as const;
            const pretendApp: any = {
                listen: jest.fn().mockReturnValue(fakeServer),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);

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
        const logger: any = {
            debug: jest.fn(),
        };
        const options: ServerOptions = {
            ...DefaultOptions,
            mode: Runtime.Development,
        } as const;
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

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
        const logger: any = {
            debug: jest.fn(),
        };
        const options: ServerOptions = {
            ...DefaultOptions,
            mode: Runtime.Production,
        } as const;
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should not import heapdumps if explicitly told not to", async () => {
        // Arrange
        const logger: any = {
            debug: jest.fn(),
        };
        const options: ServerOptions = {
            ...DefaultOptions,
            mode: Runtime.Development,
            allowHeapDumps: false,
        } as const;
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(logger.debug).not.toHaveBeenCalled();
    });

    it("should wrap the app with middleware", async () => {
        // Arrange
        const logger: any = {
            debug: jest.fn(),
        };
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
        const wrapSpy = jest
            .spyOn(WrapWithMiddleware, "wrapWithMiddleware")
            .mockResolvedValue(pretendApp);

        // Act
        await startServer(DefaultOptions, pretendApp);

        // Assert
        expect(wrapSpy).toHaveBeenCalledWith(
            pretendApp,
            logger,
            Runtime.Test,
            DefaultOptions.requestAuthentication,
        );
    });

    it("should listen on the configured port", async () => {
        // Arrange
        const pretendApp: any = {
            listen: jest.fn(),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(DefaultOptions, pretendApp);

        // Assert
        expect(pretendApp.listen).toHaveBeenCalledWith(
            42,
            "127.0.0.1",
            expect.any(Function),
        );
    });

    it("should listen for connections", async () => {
        // Arrange
        const fakeServer = {
            address: () => ({
                address: "ADDRESS",
                port: "PORT",
            }),
            on: jest.fn(),
        } as const;
        const listenMock = jest.fn().mockReturnValue(fakeServer);
        const pretendApp: any = {
            listen: listenMock,
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(DefaultOptions, pretendApp);

        // Assert
        expect(fakeServer.on).toHaveBeenCalledWith(
            "connection",
            expect.any(Function),
        );
    });

    it("should listen for connections closing", async () => {
        // Arrange
        let connectionHandler: any;
        const fakeServer = {
            address: () => ({
                address: "ADDRESS",
                port: "PORT",
            }),
            on: jest.fn().mockImplementation((event: any, fn: any) => {
                if (event === "connection") {
                    connectionHandler = fn;
                }
            }),
        } as const;
        const fakeConnection = {
            remoteAddress: "CONNECTION_ADDRESS",
            remotePort: "CONNECTION_PORT",
            on: jest.fn(),
        } as const;
        const listenMock = jest.fn().mockReturnValue(fakeServer);
        const pretendApp: any = {
            listen: listenMock,
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );
        await startServer(DefaultOptions, pretendApp);

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
        const options: ServerOptions = {
            ...DefaultOptions,
            keepAliveTimeout: 42,
        } as const;
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(options, pretendApp);
        const result = fakeServer.keepAliveTimeout;

        // Assert
        expect(result).toBe(42);
    });

    it("should set the keepAliveTimeout on the created server to 90000 when no value given", async () => {
        // Arrange
        const fakeServer = {
            address: jest.fn(),
            on: jest.fn(),
            keepAliveTimeout: 0,
        } as const;
        const pretendApp: any = {
            listen: jest.fn().mockReturnValue(fakeServer),
            use: jest.fn().mockReturnThis(),
        };
        jest.spyOn(WrapWithMiddleware, "wrapWithMiddleware").mockResolvedValue(
            pretendApp,
        );

        // Act
        await startServer(DefaultOptions, pretendApp);
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
        async ({keepAliveTimeout, headersTimeout}: any) => {
            // Arrange
            const options: ServerOptions = {
                ...DefaultOptions,
                keepAliveTimeout,
            } as const;
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                keepAliveTimeout: 0,
                headersTimeout: 0,
            } as const;
            const pretendApp: any = {
                listen: jest.fn().mockReturnValue(fakeServer),
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);

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
            const listenMock = jest.fn().mockReturnValue(null);
            const logger: any = {
                debug: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);

            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                debug: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            async (address: any) => {
                // Arrange
                const logger: any = {
                    warn: jest.fn(),
                };
                jest.spyOn(CreateLogger, "createLogger").mockReturnValue(
                    logger,
                );
                const fakeServer = {
                    address: () => address,
                    on: jest.fn(),
                } as const;
                const listenMock = jest.fn().mockReturnValue(fakeServer);
                const pretendApp: any = {
                    listen: listenMock,
                    use: jest.fn().mockReturnThis(),
                };
                jest.spyOn(
                    WrapWithMiddleware,
                    "wrapWithMiddleware",
                ).mockResolvedValue(pretendApp);
                await startServer(DefaultOptions, pretendApp);
                const warnSpy = jest.spyOn(logger, "warn");
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
            const logger: any = {
                info: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            await startServer(DefaultOptions, pretendApp);
            const infoSpy = jest.spyOn(logger, "info");
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
            const logger: any = {
                info: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const listenMock = jest.fn().mockReturnValue(null);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processSpy = jest.spyOn(process, "on");
            await startServer(DefaultOptions, pretendApp);
            const infoSpy = jest.spyOn(logger, "info");
            const processCallback = processSpy.mock.calls[0][1];

            // Act
            processCallback();

            // Assert
            expect(infoSpy).not.toHaveBeenCalled();
        });

        it("should attempt to close the server on SIGINT", async () => {
            // Arrange
            const logger: any = {
                info: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processSpy = jest.spyOn(process, "on");
            await startServer(DefaultOptions, pretendApp);
            const infoSpy = jest.spyOn(logger, "info");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            } as any;
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: () => ({
                    address: "ADDRESS",
                    port: "PORT",
                }),
                on: jest.fn(),
                close: jest.fn().mockImplementation(() => {
                    throw new Error("CLOSE ERROR");
                }),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
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
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            } as any;
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
                error: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn(),
                close: jest.fn().mockImplementation(() => {
                    // eslint-disable-next-line no-throw-literal
                    throw {};
                }),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            } as any;
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            const processExitSpy = jest
                .spyOn(process, "exit")
                .mockReturnValue(undefined as never);
            await startServer(DefaultOptions, pretendApp);
            const errorSpy = jest.spyOn(logger, "error");
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
            const logger: any = {
                info: jest.fn(),
            };
            jest.spyOn(CreateLogger, "createLogger").mockReturnValue(logger);
            let connectionHandler: any;
            const fakeServer = {
                address: jest.fn(),
                on: jest.fn().mockImplementation((event: any, fn: any) => {
                    if (event === "connection") {
                        connectionHandler = fn;
                    }
                }),
                close: jest.fn(),
            } as const;
            const fakeConnection1 = {
                remoteAddress: "CONNECTION_ADDRESS1",
                remotePort: "CONNECTION_PORT1",
                on: jest.fn(),
                destroy: jest.fn(),
            } as const;
            const fakeConnection2 = {
                remoteAddress: "CONNECTION_ADDRESS2",
                remotePort: "CONNECTION_PORT2",
                on: jest.fn(),
                destroy: jest.fn(),
            } as const;
            const fakeConnection3 = {
                remoteAddress: "CONNECTION_ADDRESS3",
                remotePort: "CONNECTION_PORT3",
                on: jest.fn(),
                destroy: jest.fn(),
            } as const;
            const listenMock = jest.fn().mockReturnValue(fakeServer);
            const pretendApp: any = {
                listen: listenMock,
                use: jest.fn().mockReturnThis(),
            };
            jest.spyOn(
                WrapWithMiddleware,
                "wrapWithMiddleware",
            ).mockResolvedValue(pretendApp);
            const processOnSpy = jest.spyOn(process, "on");
            await startServer(DefaultOptions, pretendApp);
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
