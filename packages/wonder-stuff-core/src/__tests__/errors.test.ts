import {Errors} from "../errors";

describe("Errors", () => {
    it("should be frozen", () => {
        // Arrange

        // Act
        const result = Object.isFrozen(Errors);

        // Assert
// @ts-expect-error - TS2339 - Property 'toBeTrue' does not exist on type 'JestMatchers<boolean>'.
        expect(result).toBeTrue();
    });

    it("should declare error kind strings", () => {
        // Arrange

        // Act
        const result = Object.values(Errors).every(
            (v: any) => typeof v === "string",
        );

        // Assert
// @ts-expect-error - TS2339 - Property 'toBeTrue' does not exist on type 'JestMatchers<boolean>'.
        expect(result).toBeTrue();
    });
});
