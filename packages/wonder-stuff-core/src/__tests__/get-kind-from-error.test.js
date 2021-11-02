// @flow
import {Errors} from "../errors.js";
import {getKindFromError} from "../get-kind-from-error.js";
import {KindError} from "../kind-error.js";

describe("#getKindFromError", () => {
    it.each([null, undefined, new Error("test")])(
        "should return Errors.Unknown for a non-KindError value like %s",
        (error) => {
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
