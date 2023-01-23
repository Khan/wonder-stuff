import {cloneMetadata} from "../clone-metadata";

describe("#cloneMetadata", () => {
    it.each([undefined, null])(
        "should return the metadata when it is %s",
        (value: any) => {
            // Arrange

            // Act
            const result = cloneMetadata(value);

            // Assert
            expect(result).toBe(value);
        },
    );

    it("should freeze the clone", () => {
        // Arrange
        const freezeSpy = jest.spyOn(Object, "freeze");

        // Act
        const result = cloneMetadata({});

        // Assert
        expect(freezeSpy).toHaveBeenCalledWith(result);
    });

    it("should clone a simple object", () => {
        // Arrange
        const metadata = {
            string: "bar",
            number: "42",
            boolean: "true",
            undefined: undefined,
            null: null,
        } as const;

        // Act
        const result = cloneMetadata(metadata);
// @ts-expect-error - TS2540 - Cannot assign to 'string' because it is a read-only property.
        metadata.string = "baz";
// @ts-expect-error - TS2540 - Cannot assign to 'number' because it is a read-only property.
        metadata.number = "43";
// @ts-expect-error - TS2540 - Cannot assign to 'boolean' because it is a read-only property.
        metadata.boolean = "false";
// @ts-expect-error - TS2540 - Cannot assign to 'undefined' because it is a read-only property.
        metadata.undefined = "foo";
// @ts-expect-error - TS2704 - The operand of a 'delete' operator cannot be a read-only property. | TS2790 - The operand of a 'delete' operator must be optional.
        delete metadata.null;

        // Assert
        expect(result).toEqual({
            string: "bar",
            number: "42",
            boolean: "true",
            undefined: undefined,
            null: null,
        });
        expect(result).not.toEqual(metadata);
    });

    it("should clone arrays", () => {
        // Arrange
        const metadata = {
            array: [1, 2, 3],
        } as const;

        // Act
// @ts-expect-error - TS2345 - Argument of type '{ readonly array: readonly [1, 2, 3]; }' is not assignable to parameter of type 'Readonly<Metadata>'.
        const result = cloneMetadata(metadata);
// @ts-expect-error - TS2339 - Property 'push' does not exist on type 'readonly [1, 2, 3]'.
        metadata.array.push(4);

        // Assert
        expect(result).toEqual({
            array: [1, 2, 3],
        });
        expect(result).not.toEqual(metadata);
    });

    it("should clone objects", () => {
        // Arrange
        const metadata = {
            object: {
                a: 1,
                b: 2,
            },
        } as const;

        // Act
        const result = cloneMetadata(metadata);
// @ts-expect-error - TS2540 - Cannot assign to 'a' because it is a read-only property.
        metadata.object.a = 3;

        // Assert
        expect(result).toEqual({
            object: {
                a: 1,
                b: 2,
            },
        });
        expect(result).not.toEqual(metadata);
    });

    it("should clone nested objects and arrays", () => {
        // Arrange
        const metadata = {
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
        } as const;

        // Act
// @ts-expect-error - TS2345 - Argument of type '{ readonly object: { readonly a: 1; readonly b: 2; readonly c: { readonly d: 3; readonly e: readonly [4, 5, { readonly nested: "in here"; }]; }; }; }' is not assignable to parameter of type 'Readonly<Metadata>'.
        const result = cloneMetadata(metadata);
// @ts-expect-error - TS2540 - Cannot assign to 'nested' because it is a read-only property.
        metadata.object.c.e[2].nested = "in there";

        // Assert
        expect(result).toEqual({
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
        });
        expect(result).not.toEqual(metadata);
    });
});
