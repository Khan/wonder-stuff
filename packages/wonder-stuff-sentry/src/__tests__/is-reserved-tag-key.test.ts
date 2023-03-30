import "jest-extended";
import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options";
import {isReservedTagKey} from "../is-reserved-tag-key";

describe("#isReservedTagKey", () => {
    it("should return false if a key is not reserved", () => {
        // Arrange

        // Act
        const result = isReservedTagKey(DefaultKindErrorDataOptions, "foo");

        // Assert
        expect(result).toBeFalse();
    });

    it("should return true if a key is reserved", () => {
        // Arrange

        // Act
        const result = isReservedTagKey(
            DefaultKindErrorDataOptions,
            DefaultKindErrorDataOptions.kindTagName,
        );

        // Assert
        expect(result).toBeTrue();
    });
});
