// @flow
import {safeStringify} from "../safe-stringify.js";

describe("#safeStringify", () => {
    it.each([null, undefined])(
        "should return the default for nullish values",
        (value) => {
            // Arrange
            const defaultValue = "default";

            // Act
            const result = safeStringify(value, defaultValue);

            // Assert
            expect(result).toBe(defaultValue);
        },
    );

    it("should return the default if JSON.stringify errors", () => {
        // Arrange
        const defaultValue = "default";
        jest.spyOn(JSON, "stringify").mockImplementation(() => {
            throw new Error("error");
        });

        // Act
        const result = safeStringify({}, defaultValue);

        // Assert
        expect(result).toBe(defaultValue);
    });

    it("should return the default if JSON.stringify returns a nullish value", () => {
        // Arrange
        const defaultValue = "default";
        jest.spyOn(JSON, "stringify").mockReturnValue(undefined);

        // Act
        const result = safeStringify({}, defaultValue);

        // Assert
        expect(result).toBe(defaultValue);
    });

    it("should stringify the given value", () => {
        // Arrange
        const value = {
            a: 1,
            b: 2,
        };

        // Act
        const result = safeStringify(value);

        // Assert
        expect(result).toBe(JSON.stringify(value));
    });
});
