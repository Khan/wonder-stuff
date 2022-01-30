// @flow
import winston from "winston";
// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "../types.js";

import {getLoggingTransport} from "../get-logging-transport.js";

describe("#getLoggingTransport", () => {
    describe("during test", () => {
        it("should return transport that writes to a stream", () => {
            // Arrange

            // Act
            const result = getLoggingTransport(Runtime.Test, "silly");

            // Assert
            expect(result).toBeInstanceOf(winston.transports.Stream);
        });

        it("should format log messages to include metadata", () => {
            // Arrange
            const fakePrintF = jest.fn();
            jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                jest.fn(),
            );
            jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                fakePrintF,
            );

            // Act
            getLoggingTransport(Runtime.Test, "silly");
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

            // Act
            const result = getLoggingTransport(
                ("MADE UP RUNTIME MODE": $FlowFixMe),
                "silly",
            );

            // Assert
            expect(result).toBeInstanceOf(winston.transports.Stream);
        });
    });

    describe("during development", () => {
        it("should write to the console", () => {
            // Arrange

            // Act
            const result = getLoggingTransport(Runtime.Development, "silly");

            // Assert
            expect(result).toBeInstanceOf(winston.transports.Console);
        });

        it.each([undefined, {other: "metadata"}, {}])(
            "should format log messages to include metadata when present (%s)",
            (otherMetadata) => {
                // Arrange
                const fakePrintF = jest.fn();
                jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                    jest.fn(),
                );
                jest.spyOn(winston.format, "printf", "get").mockReturnValue(
                    fakePrintF,
                );

                // Act
                getLoggingTransport(Runtime.Development, "silly");
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

            // Act
            const result = getLoggingTransport(Runtime.Production, "silly");

            // Assert
            expect(result).toBeInstanceOf(winston.transports.Console);
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
                getLoggingTransport(Runtime.Production, "silly");
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
});
