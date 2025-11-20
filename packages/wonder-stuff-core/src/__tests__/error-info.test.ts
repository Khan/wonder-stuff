import * as BuildCausedByMessage from "../build-caused-by-message";
import {ErrorInfo} from "../error-info";

jest.mock("../build-caused-by-message");

describe("ErrorInfo", () => {
    const NODE_ENV = process.env.NODE_ENV;
    afterEach(() => {
        if (NODE_ENV == null) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = NODE_ENV;
        }
    });

    describe("@message", () => {
        it("should be the error message", () => {
            // Arrange
            const underTest = new ErrorInfo("THE_NAME", "THE MESSAGE");

            // Act
            const result = underTest.message;

            // Assert
            expect(result).toEqual("THE MESSAGE");
        });
    });

    describe("#fromConsequenceAndCause", () => {
        describe("when not built for production", () => {
            it("should throw if the consequence info is not ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE");

                // Act
                const act = () =>
                    ErrorInfo.fromConsequenceAndCause(null as any, cause);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"consequence must be an instance of ErrorInfo"`,
                );
            });

            it("should throw if the cause info is not ErrorInfo", () => {
                // Arrange
                const consequence = new ErrorInfo(
                    "CONSEQUENCE_NAME",
                    "CONSEQUENCE",
                );

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(consequence, null);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"cause must be an instance of ErrorInfo"`,
                );
            });

            it("should throw if consequence and cause are the same ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE");
                const consequence = cause;

                // Act
                const act = () =>
                    ErrorInfo.fromConsequenceAndCause(consequence, cause);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"cause and consequence must be different"`,
                );
            });
        });

        describe("when built for production", () => {
            beforeEach(() => {
                process.env.NODE_ENV = "production";
            });

            // We filter out validation in prod with the expectation that
            // code won't require validation by that point.
            it("should not throw validation error if the consequence info is not ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE");

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(null, cause);

                // Assert
                expect(act).not.toThrow(
                    "consequence must be an instance of ErrorInfo",
                );
            });

            it("should not throw validation error if the cause info is not ErrorInfo", () => {
                // Arrange
                const consequence = new ErrorInfo(
                    "CONSEQUENCE_NAME",
                    "CONSEQUENCE",
                );

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(consequence, null);

                // Assert
                expect(act).not.toThrow(
                    "cause must be an instance of ErrorInfo",
                );
            });

            it("should not throw validation error if consequence and cause are the same ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE");
                const consequence = cause;

                // Act
                const act = () =>
                    ErrorInfo.fromConsequenceAndCause(consequence, cause);

                // Assert
                expect(act).not.toThrow(
                    "cause and consequence must be different",
                );
            });
        });

        it("should combine messages using buildCausedByMessage", () => {
            // Arrange
            const cause = new ErrorInfo("CAUSE_NAME", "CAUSE");
            const consequence = new ErrorInfo(
                "CONSEQUENCE_NAME",
                "CONSEQUENCE",
            );
            const buildCausedByMessageSpy = jest
                .spyOn(BuildCausedByMessage, "buildCausedByMessage")
                .mockReturnValue("COMBINED MESSAGE");

            // Act
            const result = ErrorInfo.fromConsequenceAndCause(
                consequence,
                cause,
            );

            // Assert
            expect(buildCausedByMessageSpy).toHaveBeenCalledWith(
                "CONSEQUENCE",
                "CAUSE_NAME: CAUSE",
            );
            expect(result.message).toEqual("COMBINED MESSAGE");
        });
    });

    describe("#normalize", () => {
        describe("when not built for production", () => {
            it("should throw if error is not an Error", () => {
                // Arrange
                // @ts-expect-error [FEI-5011] - TS2739 - Type '{}' is missing the following properties from type 'Error': name, message
                const error: Error = {};

                // Act
                const act = () => ErrorInfo.normalize(error);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"Error must be an instance of Error"`,
                );
            });
        });

        describe("when built for production", () => {
            beforeEach(() => {
                process.env.NODE_ENV = "production";
            });

            it("should not throw if error is not an Error", () => {
                // Arrange
                // @ts-expect-error [FEI-5011] - TS2739 - Type '{}' is missing the following properties from type 'Error': name, message
                const error: Error = {};

                // Act
                const act = () => ErrorInfo.normalize(error);

                // Assert
                expect(act).not.toThrow(
                    `"Cannot read property 'toString' of undefined"`,
                );
            });
        });

        it("should use the error.name for the name", () => {
            // Arrange
            const error = new Error("test");

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.name).toBe("Error");
        });

        it("should use the first line of the incoming error.message for the message", () => {
            // Arrange
            const error = new Error("test");

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.message).toBe("test");
        });

        it("should set the message to (empty message) when no first line can be found", () => {
            // Arrange
            const error = new Error("");

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.message).toBe("(empty message)");
        });
    });

    describe("#from", () => {
        describe("when not built for production", () => {
            it("should throw if error is not an Error", () => {
                // Arrange
                // @ts-expect-error [FEI-5011] - TS2739 - Type '{}' is missing the following properties from type 'Error': name, message
                const error: Error = {};

                // Act
                const act = () => ErrorInfo.from(error);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"Error must be an instance of Error"`,
                );
            });
        });

        describe("when built for production", () => {
            beforeEach(() => {
                process.env.NODE_ENV = "production";
            });

            it("should not throw if error is not an Error", () => {
                // Arrange
                // @ts-expect-error [FEI-5011] - TS2739 - Type '{}' is missing the following properties from type 'Error': name, message
                const error: Error = {};

                // Act
                const act = () => ErrorInfo.from(error);

                // Assert
                expect(act).not.toThrow(`"Error must be an instance of Error"`);
            });
        });

        it("should set the name to the error.name value", () => {
            // Arrange
            const error = new Error("test");

            // Act
            const result = ErrorInfo.from(error);

            // Assert
            expect(result.name).toBe("Error");
        });

        it("should set the message to the error.message value", () => {
            // Arrange
            const error = new Error("test");

            // Act
            const result = ErrorInfo.from(error);

            // Assert
            expect(result.message).toBe("test");
        });
    });
});
