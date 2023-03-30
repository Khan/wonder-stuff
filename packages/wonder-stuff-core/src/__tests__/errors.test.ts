import "jest-extended";
import {Errors} from "../errors";

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
            (v: any) => typeof v === "string",
        );

        // Assert
        expect(result).toBeTrue();
    });
});
