// @flow
import {cloneMetadata} from "../clone-metadata.js";

describe("#cloneMetadata", () => {
    it.each([undefined, null])(
        "should return the metadata when it is %s",
        (value) => {
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
        };

        // Act
        const result = cloneMetadata(metadata);
        metadata.string = "baz";
        metadata.number = "43";
        metadata.boolean = "false";
        metadata.undefined = "foo";
        // $FlowIgnore[incompatible-type]
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
        };

        // Act
        const result = cloneMetadata(metadata);
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
        };

        // Act
        const result = cloneMetadata(metadata);
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
        };

        // Act
        const result = cloneMetadata(metadata);
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
