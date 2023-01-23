import {isReservedContextProperty} from "../is-reserved-context-property";

describe("#isReservedContextProperty", () => {
    it("should return false if a property is not reserved", () => {
        // Arrange

        // Act
        const result = isReservedContextProperty("foo");

        // Assert
// @ts-expect-error - TS2551 - Property 'toBeFalse' does not exist on type 'JestMatchers<boolean>'. Did you mean 'toBeFalsy'?
        expect(result).toBeFalse();
    });

    it("should return true if a property is reserved", () => {
        // Arrange

        // Act
        const result = isReservedContextProperty("type");

        // Assert
// @ts-expect-error - TS2339 - Property 'toBeTrue' does not exist on type 'JestMatchers<boolean>'.
        expect(result).toBeTrue();
    });
});
