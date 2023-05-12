import {isTruthy, isNonNullable} from "../type-predicates";

describe("#isTruthy", () => {
    it("can be used to filter an array so that only truthy values remain", () => {
        // Arrange
        const array = [0, 5, false, true, "", "hello", undefined, null];

        // Act
        const result = array.filter(isTruthy);

        // Assert
        expect(result).toEqual([5, true, "hello"]);
    });
});

describe("#isNonNullable", () => {
    it("can be used to filter an array so that only non-nullable values remain", () => {
        // Arrange
        const array = [0, 5, false, true, "", "hello", undefined, null];

        // Act
        const result = array.filter(isNonNullable);

        // Assert
        expect(result).toEqual([0, 5, false, true, "", "hello"]);
    });
});
