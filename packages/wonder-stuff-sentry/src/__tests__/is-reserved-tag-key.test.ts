import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options";
import {isReservedTagKey} from "../is-reserved-tag-key";

describe("#isReservedTagKey", () => {
    it("should return false if a key is not reserved", () => {
        // Arrange

        // Act
        const result = isReservedTagKey(DefaultKindErrorDataOptions, "foo");

        // Assert
// @ts-expect-error - TS2551 - Property 'toBeFalse' does not exist on type 'JestMatchers<boolean>'. Did you mean 'toBeFalsy'?
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
// @ts-expect-error - TS2339 - Property 'toBeTrue' does not exist on type 'JestMatchers<boolean>'.
        expect(result).toBeTrue();
    });
});
