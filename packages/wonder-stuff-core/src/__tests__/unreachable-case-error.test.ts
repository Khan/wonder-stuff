import {Errors} from "../errors";
import {UnreachableCaseError} from "../unreachable-case-error";

describe("UnreachableCaseError", () => {
    it("should have an appropriate error message", () => {
        // Arrange
        const message = "THE MESSAGE";

        // Act
        const action = () => {
            // @ts-expect-error: this error should only be used in unreachable code
            throw new UnreachableCaseError(message);
        };

        // Assert
        expect(action).toThrowErrorMatchingInlineSnapshot(
            `"Unhandled case for 'THE MESSAGE'"`,
        );
    });

    it("should default .kind to Errors.InvalidInput", () => {
        // Arrange
        const message = "THE MESSAGE";

        // Act
        // @ts-expect-error: this error should only be used in unreachable code
        const error = new UnreachableCaseError(message);

        // Assert
        expect(error.kind).toEqual(Errors.InvalidInput);
    });

    it("should set .kind to a different value when `kind` is passed in", () => {
        // Arrange
        const message = "THE MESSAGE";
        const kind = Errors.NotFound;

        // Act
        // @ts-expect-error: this error should only be used in unreachable code
        const error = new UnreachableCaseError(message, kind);

        // Assert
        expect(error.kind).toEqual(kind);
    });

    it("should default .cause to `undefined`", () => {
        // Arrange
        const message = "THE MESSAGE";

        // Act
        // @ts-expect-error: this error should only be used in unreachable code
        const error = new UnreachableCaseError(message);

        // Assert
        expect(error.cause).toBeUndefined();
    });

    it("should set .cause when provided via options", () => {
        // Arrange
        const message = "THE MESSAGE";
        const originalError = new Error("THE ORIGINAL MESSAGE");

        // Act
        // @ts-expect-error: this error should only be used in unreachable code
        const error = new UnreachableCaseError(message, Errors.NotFound, {
            cause: originalError,
        });

        // Assert
        expect(error.cause).toEqual(originalError);
    });
});
