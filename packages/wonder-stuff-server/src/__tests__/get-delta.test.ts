import {getDelta} from "../get-delta";

describe("#getDelta", () => {
    it("should return the difference of two objects", () => {
        // Arrange
        const first = {
            a: 30,
            b: 0,
            c: 40000,
        } as const;
        const second = {
            a: 60,
            b: 30,
            c: 10000,
        } as const;

        // Act
        const result = getDelta(first, second);

        // Assert
        expect(result).toStrictEqual({
            a: 30,
            b: 30,
            c: -30000,
        });
    });
});
