// @flow
import {when} from "jest-when";

import * as CloneMetadata from "../clone-metadata.js";
import {ErrorInfo} from "../error-info.js";
import {Errors} from "../errors.js";
import {KindError} from "../kind-error.js";

jest.mock("../clone-metadata.js");

describe("KindError", () => {
    describe("#constructor", () => {
        it("should set the message", () => {
            // Arrange
            const message = "THE MESSAGE";

            // Act
            const error = new KindError(message);

            // Assert
            expect(error.message).toBe(message);
        });

        it("should set originalMessage to the message", () => {
            // Arrange
            const message = "THE MESSAGE";

            // Act
            const error = new KindError(message);

            // Assert
            expect(error.originalMessage).toBe(message);
        });

        it("should default kind", () => {
            // Arrange

            // Act
            const error = new KindError("MESSAGE");

            // Assert
            expect(error.kind).toBe(Errors.Unknown);
        });

        it("should set the kind", () => {
            // Arrange

            // Act
            const error = new KindError("MESSAGE", "CUSTOM_KIND");

            // Assert
            expect(error.kind).toBe("CUSTOM_KIND");
        });

        it("should default name", () => {
            // Arrange

            // Act
            const error = new KindError("MESSAGE");

            // Assert
            expect(error.name).toEndWith("Error");
        });

        it("should set the name", () => {
            // Arrange

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown, {
                name: "CUSTOM_NAME",
            });

            // Assert
            expect(error.name).toEndWith("CUSTOM_NAMEError");
        });

        it.each(["N A M E", "NA\nME"])(
            "should throw if the name has whitespace like %s",
            (name) => {
                // Arrange

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {name});

                // Assert
                expect(act).toThrowErrorMatchingSnapshot();
            },
        );

        it.each(["K I N D", "KI\nND"])(
            "should throw if the kind has whitespace like %s",
            (kind) => {
                // Arrange

                // Act
                const act = () => new KindError("MESSAGE", kind);

                // Assert
                expect(act).toThrowErrorMatchingSnapshot();
            },
        );

        it.each(["P R E F I X", "PRE\nFIX"])(
            "should throw if the prefix has whitespace like %s",
            (prefix) => {
                // Arrange

                // Act
                const act = () =>
                    new KindError("MESSAGE", "CUSTOM_KIND", {prefix});

                // Assert
                expect(act).toThrowErrorMatchingSnapshot();
            },
        );

        it("should throw if stripStackFrames is < 0", () => {
            // Arrange

            // Act
            const act = () =>
                new KindError("MESSAGE", "CUSTOM_KIND", {stripStackFrames: -1});

            // Assert
            expect(act).toThrowErrorMatchingInlineSnapshot(
                `"stripStackFrames must be >= 0"`,
            );
        });

        it("should throw if minimumFrameCount is < 0", () => {
            // Arrange

            // Act
            const act = () =>
                new KindError("MESSAGE", "CUSTOM_KIND", {
                    minimumFrameCount: -1,
                });

            // Assert
            expect(act).toThrowErrorMatchingInlineSnapshot(
                `"minimumFrameCount must be >= 0"`,
            );
        });

        it("should clone metadata", () => {
            // Arrange
            const metadata = {
                foo: "bar",
            };
            const spy = jest
                .spyOn(CloneMetadata, "cloneMetadata")
                .mockReturnValue("CLONED_METADATA");

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown, {metadata});

            // Assert
            expect(spy).toHaveBeenCalledWith(metadata);
            expect(error.metadata).toBe("CLONED_METADATA");
        });

        describe("when cause is non-null", () => {
            it("should throw if cause is  not an Error", () => {
                // Arrange

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {
                        // $FlowIgnore[unclear-type]
                        cause: ("NOT_AN_ERROR": any),
                    });

                // Assert
                expect(act).toThrowErrorMatchingInlineSnapshot(
                    `"cause must be an instance of Error"`,
                );
            });

            it("should get the normalized error info for the error being constructed, stripping frames", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const spy = jest.spyOn(ErrorInfo, "normalize");

                // Act
                const error = new KindError("MESSAGE", Errors.Unknown, {
                    cause,
                    stripStackFrames: 1,
                    minimumFrameCount: 2,
                });

                // Assert
                expect(spy).toHaveBeenCalledWith(error, 1, 2);
            });

            it("should get the normalized error info for the cause error, without stripping frames", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const spy = jest.spyOn(ErrorInfo, "normalize");

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {
                        cause,
                        stripStackFrames: 1,
                        minimumFrameCount: 2,
                    });
                act();

                // Assert
                expect(spy).toHaveBeenCalledWith(cause);
            });

            it("should combine the normalized error information of the constructed error and the causal error", () => {
                // Arrange
                const consequentialErrorInfo = new ErrorInfo(
                    "CONSEQUENCE_MESSAGE",
                    ["consequence1", "consequence2"],
                );
                const causalErrorInfo = new ErrorInfo("CAUSE_MESSAGE", [
                    "cause1",
                    "cause2",
                ]);
                const cause = new Error("CAUSE_MESSAGE");
                when(jest.spyOn(ErrorInfo, "normalize"))
                    .mockReturnValue(consequentialErrorInfo)
                    .calledWith(cause)
                    .mockReturnValue(causalErrorInfo);
                const spy = jest.spyOn(ErrorInfo, "fromConsequenceAndCause");

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {cause});
                act();

                // Assert
                expect(spy).toHaveBeenCalledWith(
                    consequentialErrorInfo,
                    causalErrorInfo,
                );
            });

            it("should set the stack to the combined error info string", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const combinedErrorInfo = new ErrorInfo("COMBINED_MESSAGE", [
                    "combinedstack1",
                    "combinedstack2",
                ]);
                jest.spyOn(
                    ErrorInfo,
                    "fromConsequenceAndCause",
                ).mockReturnValue(combinedErrorInfo);

                // Act
                const error = new KindError("MESSAGE", Errors.Unknown, {cause});

                // Assert
                expect(error.stack).toBe(combinedErrorInfo.toString());
            });

            it("should set the message to the combined error info message", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const combinedErrorInfo = new ErrorInfo("COMBINED_MESSAGE", [
                    "combinedstack1",
                    "combinedstack2",
                ]);
                jest.spyOn(
                    ErrorInfo,
                    "fromConsequenceAndCause",
                ).mockReturnValue(combinedErrorInfo);

                // Act
                const error = new KindError("MESSAGE", Errors.Unknown, {cause});

                // Assert
                expect(error.message).toBe(combinedErrorInfo.message);
            });
        });
    });
});
