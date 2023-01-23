// @flow
import {isReservedContextProperty} from "../is-reserved-context-property";

describe("#isReservedContextProperty", () => {
    it("should return false if a property is not reserved", () => {
        // Arrange

        // Act
        const result = isReservedContextProperty("foo");

        // Assert
        expect(result).toBeFalse();
    });

    it("should return true if a property is reserved", () => {
        // Arrange

        // Act
        const result = isReservedContextProperty("type");

        // Assert
        expect(result).toBeTrue();
    });
});
