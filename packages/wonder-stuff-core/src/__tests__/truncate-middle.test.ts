import {truncateMiddle} from "../truncate-middle";

describe("#truncateMiddle", () => {
    it.each(["", "ABCDE", "ABCDEFGH"])(
        "should return the given string if it is less than or equal to given max length",
        (testPoint: any) => {
            // Arrange

            // Act
            const result = truncateMiddle(testPoint, 8);

            // Assert
            expect(result).toBe(testPoint);
        },
    );

    it("should truncate the given string to given max length when string is greater than given max length", () => {
        // Arrange
        const maxLength = 13;

        // Act
        const result = truncateMiddle("ABCDEFGHIJKLMNOPQRSTUVWXYZ", maxLength);

        // Assert
        expect(result).toHaveLength(maxLength);
    });

    it("should replace a center chunk of the given string with an ellipsis", () => {
        // Arrange

        // Act
        const result = truncateMiddle("ABCDEFGHIJKLMNOPQRSTUVWXYZ", 13);

        // Assert
        expect(result).toBe("ABCDEF...WXYZ");
    });
});
