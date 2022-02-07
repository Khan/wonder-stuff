// @flow
import winston from "winston";
import {Errors} from "@khanacademy/wonder-stuff-core";
import * as GetLoggingTransport from "../get-logging-transport.js";
import {createLogger} from "../create-logger.js";
// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "../types.js";

describe("#createLogger", () => {
    beforeEach(() => {
        // We silence winston's console output.
        jest.spyOn(winston, "createLogger").mockReturnValue({
            debug: jest.fn(),
        });
    });

    it("should get logging transport from getLoggingTransport if none provided", () => {
        // Arrange
        const getLoggingTransportMock = jest
            .spyOn(GetLoggingTransport, "getLoggingTransport")
            .mockReturnValue("FAKE_TRANSPORT");

        // Act
        createLogger({level: "debug", mode: Runtime.Test});

        // Assert
        expect(getLoggingTransportMock).toHaveBeenCalledWith(
            (Runtime.Test: string),
            "debug",
        );
    });

    it("should not call getLoggingTransport if transport provided", () => {
        // Arrange
        const getLoggingTransportMock = jest.spyOn(
            GetLoggingTransport,
            "getLoggingTransport",
        );

        // Act
        createLogger({
            level: "debug",
            mode: Runtime.Test,
            transport: "FAKE_TRANSPORT",
        });

        // Assert
        expect(getLoggingTransportMock).not.toHaveBeenCalled();
    });

    it("should log creation parameters to created logger", () => {
        // Arrange
        const debugSpy = jest.fn();
        jest.spyOn(winston, "createLogger").mockReturnValue({
            debug: debugSpy,
        });

        // Act
        createLogger({mode: Runtime.Test, level: "info"});

        // Assert
        expect(debugSpy).toHaveBeenCalledWith(
            "Created logger (Level=info Mode=test)",
        );
    });

    it("should add a format to the winston config", () => {
        // Arrange
        // NOTE: It would be nice to spy on winston.format here and return
        // a value we can assert, but it turns out to be a bit of a pain,
        // so we leave it to its default implementation and just assert
        // that we at least set something - then verify the thing we assume it
        // sets in follow-up tests.
        const createLoggerMock = jest.spyOn(winston, "createLogger");

        // Act
        createLogger({mode: Runtime.Test, level: "info"});
        const result = createLoggerMock.mock.calls[0][0].format;

        // Assert
        expect(result).toBeDefined();
    });

    describe("added formatter", () => {
        it("should set the error kind when logging an error that has no kind", () => {
            // Arrange
            const winstonFormatSpy = jest.spyOn(winston, "format");
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.splat = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.printf = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.combine = jest.fn();
            createLogger({mode: Runtime.Test, level: "info"});
            const formatFn = winstonFormatSpy.mock.calls[0][0];

            // Act
            const result = formatFn({
                level: "error",
                message: "FAKE_MESSAGE",
            });

            // Assert
            expect(result).toHaveProperty("kind", Errors.Unknown);
        });

        it("should not set the error kind when logging an error that has a kind already set", () => {
            // Arrange
            const winstonFormatSpy = jest.spyOn(winston, "format");
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.splat = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.printf = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.combine = jest.fn();
            createLogger({mode: Runtime.Test, level: "info"});
            const formatFn = winstonFormatSpy.mock.calls[0][0];

            // Act
            const result = formatFn({
                level: "error",
                message: "FAKE_MESSAGE",
                kind: Errors.InvalidUse,
            });

            // Assert
            expect(result).toHaveProperty("kind", Errors.InvalidUse);
        });

        it("should not set the kind when the level of the message is not error", () => {
            // Arrange
            const winstonFormatSpy = jest.spyOn(winston, "format");
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.splat = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.printf = jest.fn();
            // $FlowIgnore[prop-missing]
            winstonFormatSpy.combine = jest.fn();
            createLogger({mode: Runtime.Test, level: "info"});
            const formatFn = winstonFormatSpy.mock.calls[0][0];

            // Act
            const result = formatFn({
                level: "info",
                message: "FAKE_MESSAGE",
            });

            // Assert
            expect(result).not.toHaveProperty("kind");
        });
    });
});
