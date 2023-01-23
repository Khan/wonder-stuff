// @ts-expect-error - TS7016 - Could not find a declaration file for module '../keys'. '/Users/kevinbarabash/khan/wonder-stuff/packages/wonder-stuff-core/src/keys.js' implicitly has an 'any' type.
import {keys} from "../keys";

describe("#keys", () => {
    it("should call Object.keys with the given object", () => {
        // Arrange
        const keysSpy = jest.spyOn(Object, "keys");
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        } as const;

        // Act
        keys(obj);

        // Assert
        expect(keysSpy).toHaveBeenCalledWith(obj);
    });

    it("should return the result of Object.keys", () => {
        // Arrange
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        } as const;
// @ts-expect-error - TS2345 - Argument of type 'string' is not assignable to parameter of type 'string[]'.
        jest.spyOn(Object, "keys").mockReturnValueOnce("THE RESULT");

        // Act
        const result = keys(obj);

        // Assert
        expect(result).toEqual("THE RESULT");
    });
});
