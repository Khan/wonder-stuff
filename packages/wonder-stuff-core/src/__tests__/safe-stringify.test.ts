import {safeStringify} from "../safe-stringify";

describe("#safeStringify", () => {
    describe("without options or default value argument", () => {
        it("should stringify the given value", () => {
            // Arrange
            const value = {
                a: 1,
                b: 2,
            } as const;

            // Act
            const result = safeStringify(value);

            // Assert
            expect(result).toBe(JSON.stringify(value));
        });
    });

    describe("with default value argument", () => {
        it.each([null, undefined])(
            "should return the default for nullish values",
            (value: any) => {
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
// @ts-expect-error - TS2345 - Argument of type 'undefined' is not assignable to parameter of type 'string'.
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
            (value: any) => {
                // Arrange
                const options = {
                    defaultValue: "default",
                } as const;

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
            } as const;
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
            } as const;
// @ts-expect-error - TS2345 - Argument of type 'undefined' is not assignable to parameter of type 'string'.
            jest.spyOn(JSON, "stringify").mockReturnValue(undefined);

            // Act
            const result = safeStringify({}, options.defaultValue);

            // Assert
            expect(result).toBe(options.defaultValue);
        });

        it("should not pretty format if the indent option is not given", () => {
            // Arrange
            const options: Record<string, any> = {};

            // Act
            const result = safeStringify({field: 1}, options);

            // Assert
            expect(result).not.toContain("\n");
        });

        it.each([null, undefined, 0])(
            "should not pretty format if the indent option is %s",
            (value: any) => {
                // Arrange
                const options = {
                    indent: value,
                } as const;

                // Act
                const result = safeStringify({field: 1}, options);

                // Assert
                expect(result).not.toContain("\n");
            },
        );

        it.each([2, 4])(
            "should pretty format if the indent option is %s",
            (value: any) => {
                // Arrange
                const options = {
                    indent: value,
                } as const;
                const expectedIndex = Array(value).fill(" ").join("");

                // Act
                const result = safeStringify({field: 1}, options);

                // Assert
                expect(result).toContain(`\n${expectedIndex}`);
            },
        );
    });
});
