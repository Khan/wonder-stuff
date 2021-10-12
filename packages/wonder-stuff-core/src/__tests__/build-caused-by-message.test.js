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

    it.each([null, undefined, "    ", "\n\t\t"])(
        "should default nullish and whitespace strings to (empty message)",
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
