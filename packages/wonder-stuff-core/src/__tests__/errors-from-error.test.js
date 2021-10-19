// @flow
import {KindError} from "../kind-error.js";
import {errorsFromError, Order} from "../errors-from-error.js";

describe("#errorsFromError", () => {
    it.each([null, undefined])(
        "should yield an empty sequence if the error is nullish",
        (error) => {
            // Arrange

            // Act
            const result = Array.from(
                errorsFromError(error, Order.ConsequenceFirst),
            );

            // Assert
            expect(result).toBeEmpty();
        },
    );

    it("should yield just the error in sequence if it is not a KindError derivative", () => {
        // Arrange
        const error = new Error("test");

        // Act
        const result = Array.from(
            errorsFromError(error, Order.ConsequenceFirst),
        );

        // Assert
        expect(result).toEqual([error]);
    });

    describe("when Order.ConsequenceFirst", () => {
        it("should yield errors in the order of the root error down to the lowermost cause", () => {
            // Arrange
            class MyError extends KindError {
                constructor(message: string, options: {cause?: Error}) {
                    super(message, "CustomKind", {...options});
                }
            }
            const cause3 = new Error("cause2");
            const cause2 = new MyError("cause2", {cause: cause3});
            const cause1 = new KindError("cause1", "Kind1", {cause: cause2});
            const rootError = new KindError("root", "RootKind", {
                cause: cause1,
            });

            // Act
            const result = Array.from(
                errorsFromError(rootError, Order.ConsequenceFirst),
            );

            // Assert
            expect(result).toEqual([rootError, cause1, cause2, cause3]);
        });
    });

    describe("when Order.CauseFirst", () => {
        it("should yield errors in the order of the lowermost causal error up to the root consequence", () => {
            // Arrange
            class MyError extends KindError {
                constructor(message: string, options: {cause?: Error}) {
                    super(message, "CustomKind", {...options});
                }
            }
            const cause3 = new Error("cause2");
            const cause2 = new MyError("cause2", {cause: cause3});
            const cause1 = new KindError("cause1", "Kind1", {cause: cause2});
            const rootError = new KindError("root", "RootKind", {
                cause: cause1,
            });

            // Act
            const result = Array.from(
                errorsFromError(rootError, Order.CauseFirst),
            );

            // Assert
            expect(result).toEqual([cause3, cause2, cause1, rootError]);
        });
    });
});
