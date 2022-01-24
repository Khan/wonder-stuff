// @flow
import winston from "winston";
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

    describe("during test", () => {
        it("should write to a stream", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger({mode: Runtime.Test, level: "silly"});
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Stream);
        });

        it("should format log messages to include metadata", () => {
            // Arrange
            jest.spyOn(winston, "createLogger");
            const fakePrintF = jest.fn();
            jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                jest.fn(),
            );
            jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                fakePrintF,
            );

            // Act
            createLogger({mode: Runtime.Test, level: "silly"});
            const result = fakePrintF.mock.calls[0][0]({
                level: "debug",
                message: "MESSAGE",
                other: "metadata",
            });

            // Assert
            expect(result).toMatchInlineSnapshot(`
                "debug: MESSAGE {
                    \\"other\\": \\"metadata\\"
                }"
            `);
        });
    });

    describe("unrecognised runtime mode", () => {
        it("should write to a stream", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger({
                mode: ("MADE UP RUNTIME MODE": $FlowFixMe),
                level: "silly",
            });
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Stream);
        });
    });

    describe("during development", () => {
        it("should write to the console", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger({mode: Runtime.Development, level: "silly"});
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Console);
        });

        it.each([undefined, {other: "metadata"}, {}])(
            "should format log messages to include metadata when present (%s)",
            (otherMetadata) => {
                // Arrange
                jest.spyOn(winston, "createLogger");
                const fakePrintF = jest.fn();
                jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                    jest.fn(),
                );
                jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                    fakePrintF,
                );

                // Act
                createLogger({mode: Runtime.Development, level: "silly"});
                const result = fakePrintF.mock.calls[0][0]({
                    level: "debug",
                    message: "MESSAGE",
                    ...otherMetadata,
                });

                // Assert
                expect(result).toMatchSnapshot();
            },
        );
    });

    describe("during production", () => {
        it("should write to the console", () => {
            // Arrange
            const mockCreateLogger = jest.spyOn(winston, "createLogger");

            // Act
            createLogger({mode: Runtime.Development, level: "silly"});
            const {transports} = mockCreateLogger.mock.calls[0][0];

            // Assert
            expect(transports).toBeInstanceOf(winston.transports.Console);
        });

        it.each([undefined, {other: "metadata"}, {}])(
            "should format log messages to include metadata when present (%s)",
            (otherMetadata) => {
                // Arrange
                jest.spyOn(winston, "createLogger");
                const fakePrintF = jest.fn();
                jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                    jest.fn(),
                );
                jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                    fakePrintF,
                );

                // Act
                createLogger({mode: Runtime.Development, level: "silly"});
                const result = fakePrintF.mock.calls[0][0]({
                    level: "debug",
                    message: "MESSAGE",
                    ...otherMetadata,
                });

                // Assert
                expect(result).toMatchSnapshot();
            },
        );
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
});
