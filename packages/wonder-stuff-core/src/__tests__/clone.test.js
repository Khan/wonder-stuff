// @flow
import {clone} from "../clone";

describe("#clone", () => {
    it.each([undefined, null])(
        "should return the value when it is %s",
        (value) => {
            // Arrange

            // Act
            const result = clone(value);

            // Assert
            expect(result).toBe(value);
        },
    );

    it("should clone a simple object", () => {
        // Arrange
        const originalValue = {
            string: "bar",
            number: "42",
            boolean: "true",
            undefined: undefined,
            null: null,
        };

        // Act
        const result = clone(originalValue);

        // Assert
        expect(result).toStrictEqual(originalValue);
        expect(result).not.toBe(originalValue);
    });

    it("should clone arrays", () => {
        // Arrange
        const originalValue = {
            array: [1, 2, 3],
        };

        // Act
        const result = clone(originalValue);

        // Assert
        expect(result).toStrictEqual(originalValue);
        expect(result).not.toBe(originalValue);
    });

    it("should clone objects", () => {
        // Arrange
        const originalValue = {
            object: {
                a: 1,
                b: 2,
            },
        };

        // Act
        const result = clone(originalValue);

        // Assert
        expect(result).toStrictEqual(originalValue);
        expect(result).not.toBe(originalValue);
    });

    it("should clone nested objects and arrays", () => {
        // Arrange
        const originalValue = {
            object: {
                a: 1,
                b: 2,
                c: {
                    d: 3,
                    e: [
                        4,
                        5,
                        {
                            nested: "in here",
                        },
                    ],
                },
            },
        };

        // Act
        const result = clone(originalValue);

        // Assert
        expect(result).toStrictEqual(originalValue);
        expect(result).not.toBe(originalValue);
    });
});
