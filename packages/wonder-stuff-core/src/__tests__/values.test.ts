// @ts-expect-error - TS7016 - Could not find a declaration file for module '../values'. '/Users/kevinbarabash/khan/wonder-stuff/packages/wonder-stuff-core/src/values.js' implicitly has an 'any' type.
import {values} from "../values";

describe("#values", () => {
    it("should call Object.values with the given object", () => {
        // Arrange
        const valuesSpy = jest.spyOn(Object, "values");
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        } as const;

        // Act
        values(obj);

        // Assert
        expect(valuesSpy).toHaveBeenCalledWith(obj);
    });

    it("should return the result of Object.values", () => {
        // Arrange
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        } as const;
// @ts-expect-error - TS2345 - Argument of type 'string' is not assignable to parameter of type 'any[]'.
        jest.spyOn(Object, "values").mockReturnValue("THE RESULT");

        // Act
        const result = values(obj);

        // Assert
        expect(result).toEqual("THE RESULT");
    });
});
