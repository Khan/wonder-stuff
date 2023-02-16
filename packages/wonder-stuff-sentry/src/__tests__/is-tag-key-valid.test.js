// @flow
import {isTagKeyValid} from "../is-tag-key-valid";

describe("#isTagKeyValid", () => {
    it.each([undefined, "", Array(33).fill("a").join("")])(
        "should return false if a key is not valid (%s)",
        (testPoint) => {
            // Arrange

            // Act
            const result = isTagKeyValid(testPoint);

            // Assert
            expect(result).toBeFalse();
        },
    );

    it.each(["a", Array(32).fill("a").join("")])(
        "should return true if a key is valid (%s)",
        (testPoint) => {
            // Arrange

            // Act
            const result = isTagKeyValid(testPoint);

            // Assert
            expect(result).toBeTrue();
        },
    );
});
