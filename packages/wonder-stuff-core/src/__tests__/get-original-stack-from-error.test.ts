import {getOriginalStackFromError} from "../get-original-stack-from-error";
import {KindError} from "../kind-error";

describe("#getOriginalStackFromError", () => {
    it("should return the stack of the error for a non-KindError value", () => {
        // Arrange
        const error = new Error("test");

        // Act
        const result = getOriginalStackFromError(error);

        // Assert
        expect(result).toBe(error.stack);
    });

    it("should return the original stack of the given KindError when it has no cause", () => {
        // Arrange
        const error = new KindError("test");

        // Act
        const result = getOriginalStackFromError(error);

        // Assert
        expect(result).toBe(error.stack);
    });

    it("should return the original stack of the given KindError when it has a cause", () => {
        // Arrange
        const error = new KindError("test", "CUSTOM", {
            cause: new Error("test2"),
        });

        // Act
        const result = getOriginalStackFromError(error);

        // Assert
        expect(result).toBe(error.originalStack);
    });
});
