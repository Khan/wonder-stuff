// @flow
import {safeStringify} from "../safe-stringify.js";

describe("#safeStringify", () => {
    describe("without options or default value argument", () => {
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

    describe("with default value argument", () => {
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
    });

    describe("with options argument", () => {
        it.each([null, undefined])(
            "should return the default for nullish values",
            (value) => {
                // Arrange
                const options = {
                    defaultValue: "default",
                };

                // Act
                const result = safeStringify(value, options);

                // Assert
                expect(result).toBe(options.defaultValue);
            },
        );

        it("should return the default if JSON.stringify errors", () => {
            // Arrange
            const options = {
                defaultValue: "default",
            };
            jest.spyOn(JSON, "stringify").mockImplementation(() => {
                throw new Error("error");
            });

            // Act
            const result = safeStringify({}, options);

            // Assert
            expect(result).toBe(options.defaultValue);
        });

        it("should return the default if JSON.stringify returns a nullish value", () => {
            // Arrange
            const options = {
                defaultValue: "default",
            };
            jest.spyOn(JSON, "stringify").mockReturnValue(undefined);

            // Act
            const result = safeStringify({}, options.defaultValue);

            // Assert
            expect(result).toBe(options.defaultValue);
        });

        it("should not pretty format if the indent option is not given", () => {
            // Arrange
            const options = {};

            // Act
            const result = safeStringify({field: 1}, options);

            // Assert
            expect(result).not.toContain("\n");
        });

        it.each([null, undefined, 0])(
            "should not pretty format if the indent option is %s",
            (value) => {
                // Arrange
                const options = {
                    indent: value,
                };

                // Act
                const result = safeStringify({field: 1}, options);

                // Assert
                expect(result).not.toContain("\n");
            },
        );

        it.each([2, 4])(
            "should pretty format if the indent option is %s",
            (value) => {
                // Arrange
                const options = {
                    indent: value,
                };
                const expectedIndex = Array(value).fill(" ").join("");

                // Act
                const result = safeStringify({field: 1}, options);

                // Assert
                expect(result).toContain(`\n${expectedIndex}`);
            },
        );
    });
});
