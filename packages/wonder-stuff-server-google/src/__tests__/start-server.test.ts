import * as Server from "@khanacademy/wonder-stuff-server";
import * as LoggingWinston from "@google-cloud/logging-winston";
import * as AddAppEngineMiddleware from "../add-app-engine-middleware";
import * as GetDefaultLogMetadata from "../get-default-log-metadata";
import * as SetupIntegrations from "../setup-integrations";

import {startServer} from "../start-server";

jest.mock("../setup-integrations");
jest.mock("../add-app-engine-middleware");
jest.mock("@google-cloud/logging-winston");

describe("#start-server", () => {
    beforeEach(() => {
        // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '() => void' is not assignable to parameter of type '(event: string | symbol, listener: (...args: any[]) => void) => Process'.
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
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        delete process.env.GAE_SERVICE;
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            mode: Server.Runtime.Test,
            logLevel: "debug",
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("TEST_GATEWAY");
    });

    it("should not set GAE_SERVICE if it is already set", async () => {
        // Arrange
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        process.env.GAE_SERVICE = "GAE_SERVICE_NAME";
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(process.env.GAE_SERVICE).toBe("GAE_SERVICE_NAME");
    });

    it("should setup integrations", async () => {
        // Arrange
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        const options = {
            integrations: {
                debugAgent: false,
                profiler: false,
            },
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockReturnValue(Promise.resolve(pretendApp));
        const setupStackdriverSpy = jest
            .spyOn(SetupIntegrations, "setupIntegrations")
            .mockReturnValue(Promise.resolve(pretendApp));

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(setupStackdriverSpy).toHaveBeenCalledWith("test", {
            debugAgent: false,
            profiler: false,
        });
    });

    it("should create a logger with default metadata", async () => {
        // Arrange
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        const createLoggerSpy = jest
            .spyOn(Server, "createLogger")
            // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'Logger'.ts(2345)
            .mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockResolvedValue(pretendApp);
        jest.spyOn(
            GetDefaultLogMetadata,
            "getDefaultLogMetadata",
        ).mockReturnValue({
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{ here: string; }' is not assignable to parameter of type '{ instanceID: unknown; processID: unknown; }'.
            here: "is default metadata",
        });

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(createLoggerSpy).toHaveBeenCalledWith({
            mode: Server.Runtime.Test,
            level: "debug",
            defaultMetadata: {
                here: "is default metadata",
            },
            transport: null,
        });
    });

    it("should set a custom transport for the logger when in production", async () => {
        // Arrange
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        const createLoggerSpy = jest
            .spyOn(Server, "createLogger")
            // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'Logger'.ts(2345)
            .mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Production,
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockResolvedValue(pretendApp);
        jest.spyOn(
            GetDefaultLogMetadata,
            "getDefaultLogMetadata",
        ).mockReturnValue({
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{ here: string; }' is not assignable to parameter of type '{ instanceID: unknown; processID: unknown; }'.
            here: "is default metadata",
        });
        jest.spyOn(LoggingWinston, "LoggingWinston").mockImplementation(
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '({ level, }: any) => { wut: string; }' is not assignable to parameter of type '(options?: Options | undefined) => LoggingWinston'.
            ({level}: any) => ({
                wut: `FAKE_${level}_LW_TRANSPORT`,
            }),
        );

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(createLoggerSpy).toHaveBeenCalledWith({
            mode: Server.Runtime.Production,
            level: "debug",
            defaultMetadata: {
                here: "is default metadata",
            },
            transport: {
                wut: "FAKE_debug_LW_TRANSPORT",
            },
        });
    });

    it("should add GAE middleware", async () => {
        // Arrange
        // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
        // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
        // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'Logger'.ts(2345)
        jest.spyOn(Server, "createLogger").mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        } as const;
        const pretendApp = {} as any;
        const addAppEngineMiddlewareSpy = jest
            .spyOn(AddAppEngineMiddleware, "addAppEngineMiddleware")
            .mockResolvedValue(pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(addAppEngineMiddlewareSpy).toHaveBeenCalledWith(
            pretendApp,
            "test",
            "FAKE_LOGGER",
        );
    });

    it("should start the core server", async () => {
        // Arrange
        const startServerSpy = jest
            .spyOn(Server, "startServer")
            // @ts-expect-error: Argument of type '"FAKE_SERVER"' is not assignable to parameter of
            // type 'Server<typeof IncomingMessage, typeof ServerResponse> | Promise<Server<typeof
            // IncomingMessage, typeof ServerResponse> | null | undefined> | null | undefined'.ts(2345)
            .mockResolvedValue("FAKE_SERVER");
        // @ts-expect-error: Argument of type 'string' is not assignable to parameter of type 'Logger'.ts(2345)
        jest.spyOn(Server, "createLogger").mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        } as const;
        const pretendApp = {} as any;
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockResolvedValue(pretendApp);

        // Act
        await startServer(options, pretendApp);

        // Assert
        expect(startServerSpy).toHaveBeenCalledWith(
            {
                name: "TEST_GATEWAY",
                port: 42,
                host: "127.0.0.1",
                logger: "FAKE_LOGGER",
                mode: Server.Runtime.Test,
                includeRequestMiddleware: true,
            },
            pretendApp,
        );
    });
});
