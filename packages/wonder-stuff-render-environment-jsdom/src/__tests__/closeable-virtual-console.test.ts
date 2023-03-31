import * as WSRenderServer from "@khanacademy/wonder-stuff-render-server";
import {CloseableVirtualConsole} from "../closeable-virtual-console";

jest.mock("@khanacademy/wonder-stuff-render-server");

describe("CloseableVirtualConsole", () => {
    describe("before close() is called", () => {
        it("should ignore jsdomError events for 'Could not load img'", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const underTest = new CloseableVirtualConsole(fakeLogger);

            // Act
            underTest.emit("jsdomError", new Error("Could not load img"));

            // Assert
            expect(fakeLogger.error).not.toHaveBeenCalled();
        });

        it("should report jsdomError events as logger.error", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            jest.spyOn(WSRenderServer, "extractError").mockReturnValue({
                error: "ERROR_MESSAGE",
                stack: "ERROR_STACK",
            });
            const underTest = new CloseableVirtualConsole(fakeLogger);

            // Act
            underTest.emit(
                "jsdomError",
                new Error("This is a jsdomError message"),
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "JSDOM jsdomError:ERROR_MESSAGE",
                {
                    error: "ERROR_MESSAGE",
                    kind: "Internal",
                    stack: "ERROR_STACK",
                },
            );
        });

        it("should pass errors to logger.error with args as metadata", () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const underTest = new CloseableVirtualConsole(fakeLogger);

            // Act
            underTest.emit(
                "error",
                "This is an error message",
                "and these are args",
            );

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "JSDOM error:This is an error message",
                {
                    args: ["and these are args"],
                },
            );
        });

        it.each(["warn", "info", "log", "debug"])(
            "should pass %s through to logger silly with args as metadata",
            (method: string) => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                };
                const underTest = new CloseableVirtualConsole(fakeLogger);

                // Act
                underTest.emit(
                    method,
                    "This is a logged message",
                    "and these are args",
                );

                // Assert
                expect(fakeLogger.silly).toHaveBeenCalledWith(
                    `JSDOM ${method}:This is a logged message`,
                    {
                        args: ["and these are args"],
                    },
                );
            },
        );
    });

    describe("after close() is called", () => {
        it.each(["jsdomError", "error", "warn", "log", "debug", "info"])(
            "it should not log anything for %s",
            (method: any) => {
                // Arrange
                const fakeLogger: any = {
                    /*nothing*/
                };
                const console = new CloseableVirtualConsole(fakeLogger);

                // Act
                console.close();
                const underTest = () =>
                    console.emit(
                        method,
                        "This is a logged message",
                        "and these are args",
                    );

                // Assert
                expect(underTest).not.toThrow();
            },
        );
    });
});
