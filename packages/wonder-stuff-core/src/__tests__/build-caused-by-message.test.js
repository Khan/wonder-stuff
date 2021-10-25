// @flow
import {buildCausedByMessage} from "../build-caused-by-message.js";

describe("#buildCausedByMessage", () => {
    it("should combine the strings into a 'caused by' message", () => {
        // Arrange
        const consequence = "No more Halloween candy";
        const cause = "Gluttonous parents";

        // Act
        const result = buildCausedByMessage(consequence, cause);

        // Assert
        expect(result).toMatchInlineSnapshot(`
            "No more Halloween candy
            	caused by
            		Gluttonous parents"
        `);
    });

    it.each([null, undefined])(
        "should only include cause if it is non-null",
        (testCase) => {
            // Arrange
            const consequence = "No more Halloween candy";
            const cause = testCase;

            // Act
            const result = buildCausedByMessage(consequence, cause);

            // Assert
            expect(result).toBe(consequence);
        },
    );

    it.each([null, undefined])(
        "should default nullish consequences to (empty message)",
        (testCase) => {
            // Arrange
            const consequence = testCase;
            const cause = null;

            // Act
            const result = buildCausedByMessage(consequence, cause);

            // Assert
            expect(result).toBe("(empty message)");
        },
    );

    it.each(["    ", "\n\t\t"])(
        "should default whitespace strings to (empty message)",
        (testCase) => {
            // Arrange
            const consequence = testCase;
            const cause = testCase;

            // Act
            const result = buildCausedByMessage(consequence, cause);

            // Assert
            expect(result).toMatchSnapshot();
        },
    );
});
