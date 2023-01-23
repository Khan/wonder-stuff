import * as CloneMetadata from "../clone-metadata";
import {ErrorInfo} from "../error-info";
import {Errors} from "../errors";
import {KindError} from "../kind-error";

describe("KindError", () => {
    const NODE_ENV = process.env.NODE_ENV;
    afterEach(() => {
        if (NODE_ENV == null) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = NODE_ENV;
        }
    });

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
// @ts-expect-error - TS2339 - Property 'toEndWith' does not exist on type 'JestMatchers<string>'.
            expect(error.name).toEndWith("Error");
        });

        it("should set the name", () => {
            // Arrange

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown, {
                name: "CUSTOM_NAME",
            });

            // Assert
// @ts-expect-error - TS2339 - Property 'toEndWith' does not exist on type 'JestMatchers<string>'.
            expect(error.name).toEndWith("CUSTOM_NAMEError");
        });

        describe("when not built for production", () => {
            it.each(["N A M E", "NA\nME"])(
                "should throw if the name has whitespace like %s",
                (name: any) => {
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
                (kind: any) => {
                    // Arrange

                    // Act
                    const act = () => new KindError("MESSAGE", kind);

                    // Assert
                    expect(act).toThrowErrorMatchingSnapshot();
                },
            );

            it.each(["P R E F I X", "PRE\nFIX"])(
                "should throw if the prefix has whitespace like %s",
                (prefix: any) => {
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
                    new KindError("MESSAGE", "CUSTOM_KIND", {
                        stripStackFrames: -1,
                    });

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
        });

        describe("when built for production", () => {
            beforeEach(() => {
                process.env.NODE_ENV = "production";
            });

            it.each(["N A M E", "NA\nME"])(
                "should not throw validation error if the name has whitespace like %s",
                (name: any) => {
                    // Arrange

                    // Act
                    const act = () =>
                        new KindError("MESSAGE", Errors.Unknown, {name});

                    // Assert
                    expect(act).not.toThrowError(
                        "name must not contain whitespace",
                    );
                },
            );

            it.each(["K I N D", "KI\nND"])(
                "should not throw validation error if the kind has whitespace like %s",
                (kind: any) => {
                    // Arrange

                    // Act
                    const act = () => new KindError("MESSAGE", kind);

                    // Assert
                    expect(act).not.toThrowError(
                        "kind must not contain whitespace",
                    );
                },
            );

            it.each(["P R E F I X", "PRE\nFIX"])(
                "should not throw validation error if the prefix has whitespace like %s",
                (prefix: any) => {
                    // Arrange

                    // Act
                    const act = () =>
                        new KindError("MESSAGE", "CUSTOM_KIND", {prefix});

                    // Assert
                    expect(act).not.toThrowError(
                        "prefix must not contain whitespace",
                    );
                },
            );

            it("should not throw validation error if stripStackFrames is < 0", () => {
                // Arrange

                // Act
                const act = () =>
                    new KindError("MESSAGE", "CUSTOM_KIND", {
                        stripStackFrames: -1,
                    });

                // Assert
                expect(act).not.toThrowError("stripStackFrames must be >= 0");
            });

            it("should not throw validation error if minimumFrameCount is < 0", () => {
                // Arrange

                // Act
                const act = () =>
                    new KindError("MESSAGE", "CUSTOM_KIND", {
                        minimumFrameCount: -1,
                    });

                // Assert
                expect(act).not.toThrowError("minimumFrameCount must be >= 0");
            });
        });

        it("should clone metadata", () => {
            // Arrange
            const metadata = {
                foo: "bar",
            } as const;
            const cloneMetadataSpy = jest
                .spyOn(CloneMetadata, "cloneMetadata")
// @ts-expect-error - TS2345 - Argument of type '"CLONED_METADATA"' is not assignable to parameter of type 'Readonly<Metadata> | null | undefined'.
                .mockReturnValue("CLONED_METADATA");

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown, {metadata});

            // Assert
            expect(cloneMetadataSpy).toHaveBeenCalledWith(metadata);
            expect(error.metadata).toBe("CLONED_METADATA");
        });

        it("should get the normalized error info for the error being constructed, stripping frames", () => {
            // Arrange
            const normalizeSpy = jest.spyOn(ErrorInfo, "normalize");

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown, {
                stripStackFrames: 1,
                minimumFrameCount: 2,
            });

            // Assert
            expect(normalizeSpy).toHaveBeenCalledWith(error, 1, 2);
        });

        it("should set the stack to the normalized value", () => {
            // Arrange
            const normalizedErrorInfo = new ErrorInfo(
                "NORMALIZED_NAME",
                "NORMALIZED_MESSAGE",
                ["normalizedstack1", "normalizedstack2"],
            );
            jest.spyOn(ErrorInfo, "normalize").mockReturnValue(
                normalizedErrorInfo,
            );

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown);

            // Assert
            expect(error.stack).toBe(normalizedErrorInfo.standardizedStack);
        });

        it("should not set the message to the normalized value", () => {
            // Arrange
            const normalizedErrorInfo = new ErrorInfo(
                "NORMALIZED_NAME",
                "NORMALIZED_MESSAGE",
                ["normalizedstack1", "normalizedstack2"],
            );
            jest.spyOn(ErrorInfo, "normalize").mockReturnValue(
                normalizedErrorInfo,
            );

            // Act
            const error = new KindError("MESSAGE", Errors.Unknown);

            // Assert
            expect(error.message).toBe("MESSAGE");
        });

        describe("when cause is non-null", () => {
            describe("when not built for production", () => {
                it("should throw if cause is not an Error", () => {
                    // Arrange

                    // Act
                    const act = () =>
                        new KindError("MESSAGE", Errors.Unknown, {
                            // $FlowIgnore[incompatible-call]
// @ts-expect-error - TS2322 - Type 'string' is not assignable to type 'Error | null | undefined'.
                            cause: "NOT_AN_ERROR",
                        });

                    // Assert
                    expect(act).toThrowErrorMatchingInlineSnapshot(
                        `"cause must be an instance of Error"`,
                    );
                });
            });

            describe("when built for production", () => {
                beforeEach(() => {
                    process.env.NODE_ENV = "production";
                });

                it("should not throw if cause is not an Error", () => {
                    // Arrange

                    // Act
                    const act = () =>
                        new KindError("MESSAGE", Errors.Unknown, {
                            // $FlowIgnore[incompatible-call]
// @ts-expect-error - TS2322 - Type 'string' is not assignable to type 'Error | null | undefined'.
                            cause: "NOT_AN_ERROR",
                        });

                    // Assert
                    expect(act).not.toThrowError(
                        `"Error must be an instance of Error"`,
                    );
                });
            });

            it("should get error info for the cause error", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const fromSpy = jest.spyOn(ErrorInfo, "from");

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {
                        cause,
                        stripStackFrames: 1,
                        minimumFrameCount: 2,
                    });
                act();

                // Assert
                expect(fromSpy).toHaveBeenCalledWith(cause);
            });

            it("should combine the normalized error information of the constructed error and the regular error information from the causal error", () => {
                // Arrange
                const consequentialErrorInfo = new ErrorInfo(
                    "CONSEQUENCE_NAME",
                    "CONSEQUENCE_MESSAGE",
                    ["consequence1", "consequence2"],
                );
                const causalErrorInfo = new ErrorInfo(
                    "CAUSE_NAME",
                    "CAUSE_MESSAGE",
                    ["cause1", "cause2"],
                );
                const cause = new Error("CAUSE_MESSAGE");
                jest.spyOn(ErrorInfo, "normalize").mockReturnValue(
                    consequentialErrorInfo,
                );
                jest.spyOn(ErrorInfo, "from").mockReturnValue(causalErrorInfo);
                const fromConsequenceAndCauseSpy = jest.spyOn(
                    ErrorInfo,
                    "fromConsequenceAndCause",
                );

                // Act
                const act = () =>
                    new KindError("MESSAGE", Errors.Unknown, {cause});
                act();

                // Assert
                expect(fromConsequenceAndCauseSpy).toHaveBeenCalledWith(
                    consequentialErrorInfo,
                    causalErrorInfo,
                );
            });

            it("should set the message to the combined error info message", () => {
                // Arrange
                const cause = new Error("CAUSE_MESSAGE");
                const combinedErrorInfo = new ErrorInfo(
                    "COMBINED_NAME",
                    "COMBINED_MESSAGE",
                    ["combinedstack1", "combinedstack2"],
                );
                jest.spyOn(
                    ErrorInfo,
                    "fromConsequenceAndCause",
                ).mockReturnValue(combinedErrorInfo);

                // Act
                const error = new KindError("MESSAGE", Errors.Unknown, {cause});

                // Assert
                expect(error.message).toBe(combinedErrorInfo.message);
            });

            it("should have a combined message that cascades all causes", () => {
                // Arrange
                const cause1 = new Error("CAUSE_MESSAGE");
                const cause2 = new KindError(
                    "CAUSE_2_MESSAGE",
                    Errors.Unknown,
                    {cause: cause1},
                );

                // Act
                const result = new KindError("ROOT_MESSAGE", Errors.Unknown, {
                    cause: cause2,
                });

                // Assert
                expect(result.message).toMatchInlineSnapshot(`
                    "ROOT_MESSAGE
                    	caused by
                    		UnknownError: CAUSE_2_MESSAGE
                    	caused by
                    		Error: CAUSE_MESSAGE"
                `);
            });

            describe("when compositeStack is true", () => {
                it("should set the stack to the combined error standardized stack", () => {
                    // Arrange
                    const cause = new Error("CAUSE_MESSAGE");
                    const combinedErrorInfo = new ErrorInfo(
                        "COMBINED_NAME",
                        "COMBINED_MESSAGE",
                        ["combinedstack1", "combinedstack2"],
                    );
                    jest.spyOn(
                        ErrorInfo,
                        "fromConsequenceAndCause",
                    ).mockReturnValue(combinedErrorInfo);

                    // Act
                    const error = new KindError("MESSAGE", Errors.Unknown, {
                        cause,
                        compositeStack: true,
                    });

                    // Assert
                    expect(error.stack).toBe(
                        combinedErrorInfo.standardizedStack,
                    );
                });
            });

            describe.each([undefined, null, false])(
                "when composite stack is %s",
                (compositeStackValue: any) => {
                    it("should set the stack to the normalized stack, not the combined stack", () => {
                        // Arrange
                        const normalizedErrorInfo = new ErrorInfo(
                            "NORMALIZED_NAME",
                            "NORMALIZED_MESSAGE",
                            ["normalizedstack1", "normalizedstack2"],
                        );
                        jest.spyOn(ErrorInfo, "normalize").mockReturnValue(
                            normalizedErrorInfo,
                        );
                        const cause = new Error("CAUSE_MESSAGE");
                        const combinedErrorInfo = new ErrorInfo(
                            "COMBINED_NAME",
                            "COMBINED_MESSAGE",
                            ["combinedstack1", "combinedstack2"],
                        );
                        jest.spyOn(
                            ErrorInfo,
                            "fromConsequenceAndCause",
                        ).mockReturnValue(combinedErrorInfo);

                        // Act
                        const error = new KindError("MESSAGE", Errors.Unknown, {
                            cause,
                            compositeStack: compositeStackValue,
                        });

                        // Assert
                        expect(error.stack).toBe(
                            normalizedErrorInfo.standardizedStack,
                        );
                    });
                },
            );
        });
    });
});
