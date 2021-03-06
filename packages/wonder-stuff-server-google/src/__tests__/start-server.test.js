// @flow
import * as Server from "@khanacademy/wonder-stuff-server";
import * as LoggingWinston from "@google-cloud/logging-winston";
import * as AddAppEngineMiddleware from "../add-app-engine-middleware.js";
import * as GetDefaultLogMetadata from "../get-default-log-metadata.js";
import * as SetupIntegrations from "../setup-integrations.js";

import {startServer} from "../start-server.js";

jest.mock("../setup-integrations.js");
jest.mock("../add-app-engine-middleware.js");
jest.mock("@google-cloud/logging-winston");

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
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        delete process.env.GAE_SERVICE;
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            mode: Server.Runtime.Test,
            logLevel: "debug",
        };
        const pretendApp = ({}: $FlowFixMe);
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
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        process.env.GAE_SERVICE = "GAE_SERVICE_NAME";
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        };
        const pretendApp = ({}: $FlowFixMe);
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
        };
        const pretendApp = ({}: $FlowFixMe);
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
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        const createLoggerSpy = jest
            .spyOn(Server, "createLogger")
            .mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        };
        const pretendApp = ({}: $FlowFixMe);
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockResolvedValue(pretendApp);
        jest.spyOn(
            GetDefaultLogMetadata,
            "getDefaultLogMetadata",
        ).mockReturnValue({
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
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        const createLoggerSpy = jest
            .spyOn(Server, "createLogger")
            .mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Production,
        };
        const pretendApp = ({}: $FlowFixMe);
        jest.spyOn(
            AddAppEngineMiddleware,
            "addAppEngineMiddleware",
        ).mockResolvedValue(pretendApp);
        jest.spyOn(
            GetDefaultLogMetadata,
            "getDefaultLogMetadata",
        ).mockReturnValue({
            here: "is default metadata",
        });
        jest.spyOn(LoggingWinston, "LoggingWinston").mockImplementation(
            ({level}) => ({
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
        jest.spyOn(Server, "startServer").mockResolvedValue("FAKE_SERVER");
        jest.spyOn(Server, "createLogger").mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        };
        const pretendApp = ({}: $FlowFixMe);
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
            .mockResolvedValue("FAKE_SERVER");
        jest.spyOn(Server, "createLogger").mockReturnValue("FAKE_LOGGER");
        const options = {
            name: "TEST_GATEWAY",
            port: 42,
            host: "127.0.0.1",
            logLevel: "debug",
            mode: Server.Runtime.Test,
        };
        const pretendApp = ({}: $FlowFixMe);
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
