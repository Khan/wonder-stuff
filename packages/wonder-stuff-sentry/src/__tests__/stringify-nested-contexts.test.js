// @flow
import {stringifyNestedContexts} from "../stringify-nested-contexts.js";

describe("#stringifyNestedContexts", () => {
    it("should not stringify top-level objects, arrays, or nested primitives", () => {
        // Arrange
        const input = {
            context1: {
                foo: "bar",
                baz: [1, 2, 3],
                qux: {
                    quux: "corge",
                },
            },
        };

        // Act
        const result = stringifyNestedContexts(input);

        // Assert
        expect(result).toStrictEqual(input);
    });

    it("should stringify objects and arrays nested inside top-level objects and arrays", () => {
        // Arrange
        const input = {
            context1: {
                foo: {
                    baz: [1, 2, 3],
                    bar: {
                        bingo: "bango",
                    },
                },
                qux: [
                    {
                        quux: "corge",
                    },
                    [1, 2, 3],
                ],
            },
        };

        // Act
        const result = stringifyNestedContexts(input);

        // Assert
        expect(result).toStrictEqual({
            context1: {
                foo: {
                    baz: "[1,2,3]",
                    bar: '{"bingo":"bango"}',
                },
                qux: ['{"quux":"corge"}', "[1,2,3]"],
            },
        });
    });
});
