// @flow
import {Errors} from "../errors.js";

describe("Errors", () => {
    it("should be frozen", () => {
        // Arrange

        // Act
        const result = Object.isFrozen(Errors);

        // Assert
        expect(result).toBeTrue();
    });

    it("should declare error kind strings", () => {
        // Arrange

        // Act
        const result = Object.values(Errors).every(
            (v) => typeof v === "string",
        );

        // Assert
        expect(result).toBeTrue();
    });
});
