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
        // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{ readonly a: 60; readonly b: 30; readonly c: 10000; }' is not assignable to parameter of type '{ readonly a: 30; readonly b: 0; readonly c: 40000; }'.
        const result = getDelta(first, second);

        // Assert
        expect(result).toStrictEqual({
            a: 30,
            b: 30,
            c: -30000,
        });
    });
});
