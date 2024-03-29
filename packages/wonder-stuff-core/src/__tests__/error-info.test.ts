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

    describe("@standardizedStack", () => {
        it("should combine the name, message, and stack into a string", () => {
            // Arrange
            const theStack = ["\trecent", "\tolder", "\toldest"];
            const underTest = new ErrorInfo(
                "THE_NAME",
                "THE MESSAGE",
                theStack,
            );

            // Act
            const result = underTest.standardizedStack;

            // Assert
            expect(result).toMatchInlineSnapshot(`
                "THE_NAME: THE MESSAGE
                	recent
                	older
                	oldest"
            `);
        });
    });

    describe("@message", () => {
        it("should be the error message", () => {
            // Arrange
            const underTest = new ErrorInfo("THE_NAME", "THE MESSAGE", []);

            // Act
            const result = underTest.message;

            // Assert
            expect(result).toEqual("THE MESSAGE");
        });
    });

    describe("@stack", () => {
        it("should be the error stack", () => {
            // Arrange
            const theStack = ["recent", "older", "oldest"];
            const underTest = new ErrorInfo(
                "THE_NAME",
                "THE MESSAGE",
                theStack,
            );

            // Act
            const result = underTest.stack;

            // Assert
            expect(result).toEqual(theStack);
        });
    });

    describe("#fromConsequenceAndCause", () => {
        describe("when not built for production", () => {
            it("should throw if the consequence info is not ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", []);

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(null, cause);

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
                    [],
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
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", []);
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
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", []);

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(null, cause);

                // Assert
                expect(act).not.toThrowError(
                    "consequence must be an instance of ErrorInfo",
                );
            });

            it("should not throw validation error if the cause info is not ErrorInfo", () => {
                // Arrange
                const consequence = new ErrorInfo(
                    "CONSEQUENCE_NAME",
                    "CONSEQUENCE",
                    [],
                );

                // Act
                const act = () =>
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'null' is not assignable to parameter of type 'ErrorInfo'.
                    ErrorInfo.fromConsequenceAndCause(consequence, null);

                // Assert
                expect(act).not.toThrowError(
                    "cause must be an instance of ErrorInfo",
                );
            });

            it("should not throw validation error if consequence and cause are the same ErrorInfo", () => {
                // Arrange
                const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", []);
                const consequence = cause;

                // Act
                const act = () =>
                    ErrorInfo.fromConsequenceAndCause(consequence, cause);

                // Assert
                expect(act).not.toThrowError(
                    "cause and consequence must be different",
                );
            });
        });

        it("should combine messages using buildCausedByMessage", () => {
            // Arrange
            const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", []);
            const consequence = new ErrorInfo(
                "CONSEQUENCE_NAME",
                "CONSEQUENCE",
                [],
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

        it("should deduplicate the bottom of the incoming stacks", () => {
            // Arrange
            const duplicateStack = ["duplicate1", "duplicate2"];
            const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", duplicateStack);
            const consequence = new ErrorInfo(
                "CONSEQUENCE_NAME",
                "CONSEQUENCE",
                duplicateStack,
            );

            // Act
            const result = ErrorInfo.fromConsequenceAndCause(
                consequence,
                cause,
            );

            // Assert
            expect(result.stack).toEqual(duplicateStack);
        });

        it("should insert the causal stack frames before the consequence frames", () => {
            // Arrange
            const causalOnlyStack = ["causalOnly1", "causalOnly2"];
            const consequenceOnlyStack = [
                "consequenceOnly1",
                "consequenceOnly2",
            ];
            const duplicateStack = ["duplicate1", "duplicate2"];
            const cause = new ErrorInfo("CAUSE_NAME", "CAUSE", [
                ...causalOnlyStack,
                ...duplicateStack,
            ]);
            const consequence = new ErrorInfo(
                "CONSEQUENCE_NAME",
                "CONSEQUENCE",
                [...consequenceOnlyStack, ...duplicateStack],
            );

            // Act
            const result = ErrorInfo.fromConsequenceAndCause(
                consequence,
                cause,
            );

            // Assert
            expect(result.stack).toEqual([
                ...consequenceOnlyStack,
                ...causalOnlyStack,
                ...duplicateStack,
            ]);
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

            it("should throw if stripFrames is < 0", () => {
                // Arrange
                const error = new Error("test");

                // Act
                const act = () => ErrorInfo.normalize(error, -1);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"stripFrames must be >= 0"`,
                );
            });

            it("should throw if minimumFrameCount is < 0", () => {
                // Arrange
                const error = new Error("test");

                // Act
                const act = () => ErrorInfo.normalize(error, 0, -1);

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"minimumFrameCount must be >= 0"`,
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
                expect(act).not.toThrowError(
                    `"Cannot read property 'toString' of undefined"`,
                );
            });

            it("should not throw if stripFrames is < 0", () => {
                // Arrange
                const error = new Error("test");

                // Act
                const act = () => ErrorInfo.normalize(error, -1);

                // Assert
                expect(act).not.toThrowError(`"stripFrames must be >= 0"`);
            });

            it("should not throw if minimumFrameCount is < 0", () => {
                // Arrange
                const error = new Error("test");

                // Act
                const act = () => ErrorInfo.normalize(error, 0, -1);

                // Assert
                expect(act).not.toThrowError(
                    `"minimumFrameCount must be >= 0"`,
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

        it("should create the stack array without the error.toString text", () => {
            // Arrange
            const error = new Error("test");
            // Have to mock out the stack because otherwise it may contain
            // specifics to the given test environment, which will change
            // depending on where the test is run.
            error.stack = "Error: test\nframe1\nframe2\nframe3";

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.stack).toEqual(["frame1", "frame2", "frame3"]);
        });

        it("should create the stack array including the error.toString text if error.stack and error.toString are the same", () => {
            // Arrange
            const error = new Error("test");
            const stackAndToString = "Error: test\nframe1\nframe2\nframe3";
            // @ts-expect-error [FEI-5011] - TS2769 - No overload matches this call. | TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'.
            jest.spyOn(error, "toString").mockReturnValue(stackAndToString);
            error.stack = stackAndToString;

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.stack).toEqual([
                "Error: test",
                "frame1",
                "frame2",
                "frame3",
            ]);
        });

        it("should create an empty stack array if there is no stack", () => {
            // Arrange
            const error = new Error("test");
            delete error.stack;

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.stack).toEqual([]);
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
                expect(act).not.toThrowError(
                    `"Error must be an instance of Error"`,
                );
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

        it("should create the stack array without the error.toString text", () => {
            // Arrange
            const error = new Error("test");
            // Have to mock out the stack because otherwise it may contain
            // specifics to the given test environment, which will change
            // depending on where the test is run.
            error.stack = "Error: test\nframe1\nframe2\nframe3";

            // Act
            const result = ErrorInfo.from(error);

            // Assert
            expect(result.stack).toEqual(["frame1", "frame2", "frame3"]);
        });

        it("should create the stack array including the error.toString text if error.stack and error.toString are the same", () => {
            // Arrange
            const error = new Error("test");
            const stackAndToString = "Error: test\nframe1\nframe2\nframe3";
            // @ts-expect-error [FEI-5011] - TS2769 - No overload matches this call. | TS2345 - Argument of type 'string' is not assignable to parameter of type 'never'.
            jest.spyOn(error, "toString").mockReturnValue(stackAndToString);
            error.stack = stackAndToString;

            // Act
            const result = ErrorInfo.from(error);

            // Assert
            expect(result.stack).toEqual([
                "Error: test",
                "frame1",
                "frame2",
                "frame3",
            ]);
        });

        it("should create an empty stack array if there is no stack", () => {
            // Arrange
            const error = new Error("test");
            delete error.stack;

            // Act
            const result = ErrorInfo.from(error);

            // Assert
            expect(result.stack).toEqual([]);
        });
    });
});
