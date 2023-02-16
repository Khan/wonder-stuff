import {Errors} from "../errors";
import {getKindFromError} from "../get-kind-from-error";
import {KindError} from "../kind-error";

describe("#getKindFromError", () => {
    it.each([null, undefined, new Error("test")])(
        "should return Errors.Unknown for a non-KindError value like %s",
        (error: any) => {
            // Arrange

            // Act
            const result = getKindFromError(error);

            // Assert
            expect(result).toBe(Errors.Unknown);
        },
    );

    it("should return the kind of the given KindError", () => {
        // Arrange
        const error = new KindError("test", "CUSTOM_KIND");

        // Act
        const result = getKindFromError(error);

        // Assert
        expect(result).toBe("CUSTOM_KIND");
    });
});
