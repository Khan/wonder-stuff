import * as Superagent from "superagent";
import * as WSServer from "@khanacademy/wonder-stuff-server";
import * as MakeShouldRetry from "../make-should-retry";

import {makeUnbufferedNoCacheRequest} from "../make-unbuffered-no-cache-request";

jest.mock("superagent");
jest.mock("@khanacademy/wonder-stuff-server");
jest.mock("../make-should-retry");

describe("#makeUnbufferedNoCacheRequest", () => {
    it("should get the URL", () => {
        // Arrange
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeOptions: any = {};
        const fakeLogger: any = {};
        const getSpy = jest
            .spyOn(Superagent, "get")
            .mockReturnValue(fakeSuperagent);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(getSpy).toHaveBeenCalledWith("URL");
    });

    it("should apply the agent to the request", () => {
        // Arrange
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeAgent = "FAKE_AGENT";
        const fakeOptions: any = {agent: fakeAgent};
        const fakeLogger: any = {};
        jest.spyOn(Superagent, "get").mockReturnValue(fakeSuperagent);
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(fakeSuperagent.agent).toHaveBeenCalledWith(fakeAgent);
    });

    it("should use retries count from options", () => {
        // Arrange
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeOptions: any = {
            retries: 42,
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(Superagent, "get").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(fakeSuperagent.retry).toHaveBeenCalledWith(42, fakeShouldRetry);
    });

    it("should make shouldRetry with override from options and logger", () => {
        // Arrange
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeOptions: any = {
            shouldRetry: jest.fn(),
        };
        const fakeLogger: any = {};
        jest.spyOn(Superagent, "get").mockReturnValue(fakeSuperagent);
        const makeShouldRetrySpy = jest.spyOn(
            MakeShouldRetry,
            "makeShouldRetry",
        );
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(makeShouldRetrySpy).toHaveBeenCalledWith(
            fakeLogger,
            fakeOptions.shouldRetry,
        );
    });

    it("should set the User-Agent header with gateway info", () => {
        // Arrange
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({
            name: "TEST_GAE_SERVICE",
            version: "TEST_GAE_VERSION",
        } as any);
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeOptions: any = {};
        const fakeLogger: any = {};
        jest.spyOn(Superagent, "get").mockReturnValue(fakeSuperagent);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(fakeSuperagent.set).toHaveBeenCalledWith(
            "User-Agent",
            "TEST_GAE_SERVICE (TEST_GAE_VERSION)",
        );
    });

    it("should set timeout from options", () => {
        // Arrange
        const fakeSuperagent = {
            agent: jest.fn().mockReturnThis(),
            retry: jest.fn().mockReturnThis(),
            set: jest.fn().mockReturnThis(),
            timeout: jest.fn().mockReturnThis(),
        } as any;
        const fakeOptions: any = {
            timeout: 42,
        };
        const fakeShouldRetry = jest.fn();
        const fakeLogger: any = {};
        jest.spyOn(Superagent, "get").mockReturnValue(fakeSuperagent);
        jest.spyOn(MakeShouldRetry, "makeShouldRetry").mockReturnValue(
            fakeShouldRetry,
        );
        jest.spyOn(WSServer, "getAppEngineInfo").mockReturnValue({} as any);

        // Act
        makeUnbufferedNoCacheRequest(fakeOptions, fakeLogger, "URL");

        // Assert
        expect(fakeSuperagent.timeout).toHaveBeenCalledWith(42);
    });
});
