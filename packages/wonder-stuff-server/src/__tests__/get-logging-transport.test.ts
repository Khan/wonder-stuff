import * as winston from "winston";
import {Runtime} from "../types";

import {getLoggingTransport} from "../get-logging-transport";

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
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
            jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                jest.fn(),
            );
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
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
                    "other": "metadata"
                }"
            `);
        });
    });

    describe("unrecognised runtime mode", () => {
        it("should write to a stream", () => {
            // Arrange

            // Act
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '"MADE UP RUNTIME MODE"' is not assignable to parameter of type '"production" | "test" | "development"'.
            const result = getLoggingTransport("MADE UP RUNTIME MODE", "silly");

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
            (otherMetadata: any) => {
                // Arrange
                const fakePrintF = jest.fn();
                // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
                jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                    jest.fn(),
                );
                // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
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
            (otherMetadata: any) => {
                // Arrange
                jest.spyOn(winston, "createLogger");
                const fakePrintF = jest.fn();
                // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
                jest.spyOn(winston.format, "combine", "get").mockReturnValue(
                    jest.fn(),
                );
                // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'. | TS2339 - Property 'mockReturnValue' does not exist on type 'never'.
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
