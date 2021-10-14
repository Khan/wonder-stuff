// @flow
import * as BuildCausedByMessage from "../build-caused-by-message.js";
import {ErrorInfo} from "../error-info.js";

jest.mock("../build-caused-by-message.js");

describe("ErrorInfo", () => {
    describe("#toString", () => {
        it("should combine the message and stack into a string", () => {
            // Arrange
            const theStack = ["\trecent", "\tolder", "\toldest"];
            const underTest = new ErrorInfo("THE MESSAGE", theStack);

            // Act
            const result = underTest.toString();

            // Assert
            expect(result).toMatchInlineSnapshot(`
                "THE MESSAGE
                	recent
                	older
                	oldest"
            `);
        });
    });

    describe("@message", () => {
        it("should be the error message", () => {
            // Arrange
            const underTest = new ErrorInfo("THE MESSAGE", []);

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
            const underTest = new ErrorInfo("THE MESSAGE", theStack);

            // Act
            const result = underTest.stack;

            // Assert
            expect(result).toEqual(theStack);
        });
    });

    describe("#fromConsequenceAndCause", () => {
        it("should throw if the consequence info is not ErrorInfo", () => {
            // Arrange
            const cause = new ErrorInfo("CAUSE", []);

            // Act
            const act = () =>
                ErrorInfo.fromConsequenceAndCause((null: any), cause);

            // Assert
            expect(act).toThrowErrorMatchingInlineSnapshot(
                `"consequence must be an instance of ErrorInfo"`,
            );
        });

        it("should throw if the cause info is not ErrorInfo", () => {
            // Arrange
            const consequence = new ErrorInfo("CONSEQUENCE", []);

            // Act
            const act = () =>
                ErrorInfo.fromConsequenceAndCause(consequence, (null: any));

            // Assert
            expect(act).toThrowErrorMatchingInlineSnapshot(
                `"cause must be an instance of ErrorInfo"`,
            );
        });

        it("should throw if consequence and cause are the same ErrorInfo", () => {
            // Arrange
            const cause = new ErrorInfo("CAUSE", []);
            const consequence = cause;

            // Act
            const act = () =>
                ErrorInfo.fromConsequenceAndCause(consequence, cause);

            // Assert
            expect(act).toThrowErrorMatchingInlineSnapshot(
                `"cause and consequence must be different"`,
            );
        });

        it("should combine messages using buildCausedByMessage", () => {
            // Arrange
            const cause = new ErrorInfo("CAUSE", []);
            const consequence = new ErrorInfo("CONSEQUENCE", []);
            const spy = jest
                .spyOn(BuildCausedByMessage, "buildCausedByMessage")
                .mockReturnValue("COMBINED MESSAGE");

            // Act
            const result = ErrorInfo.fromConsequenceAndCause(
                consequence,
                cause,
            );

            // Assert
            expect(spy).toHaveBeenCalledWith("CONSEQUENCE", "CAUSE");
            expect(result.message).toEqual("COMBINED MESSAGE");
        });

        it("should deduplicate the bottom of the incoming stacks", () => {
            // Arrange
            const duplicateStack = ["duplicate1", "duplicate2"];
            const cause = new ErrorInfo("CAUSE", duplicateStack);
            const consequence = new ErrorInfo("CONSEQUENCE", duplicateStack);

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
            const cause = new ErrorInfo("CAUSE", [
                ...causalOnlyStack,
                ...duplicateStack,
            ]);
            const consequence = new ErrorInfo("CONSEQUENCE", [
                ...consequenceOnlyStack,
                ...duplicateStack,
            ]);

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
        it("should throw if error is not an Error", () => {
            // Arrange
            const error: Error = ({}: any);

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

        it("should use the first line of the incoming error.toString for the normalized message", () => {
            // Arrange
            const error = new Error("test");

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.message).toBe("Error: test");
        });

        it("should set the normalized message to (empty message) when no first line can be found", () => {
            // Arrange
            const error = new Error("test");
            jest.spyOn(error, "toString").mockReturnValue("");

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
            // $FlowIgnore[incompatible-type]
            delete error.stack;

            // Act
            const result = ErrorInfo.normalize(error);

            // Assert
            expect(result.stack).toEqual([]);
        });
    });
});
