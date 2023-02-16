// @flow
import {truncateTagValue} from "../truncate-tag-value";

describe("#truncateTagValue", () => {
    it.each(["", "ABCDEFGHIJK", Array(200).fill("a").join("")])(
        "should not truncate tag values that do not need it (%s)",
        (testPoint) => {
            // Arrange

            // Act
            const result = truncateTagValue(testPoint);

            // Assert
            expect(result).toBe(testPoint);
        },
    );

    it("should truncate tag values that need it", () => {
        // Arrange
        const longTagValue = Array(201).fill("a").join("");

        // Act
        const result = truncateTagValue(longTagValue);

        // Assert
        expect(result).toHaveLength(200);
    });
});
