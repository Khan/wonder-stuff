// @flow
import {keys} from "../keys.js";

describe("#keys", () => {
    it("should call Object.keys with the given object", () => {
        // Arrange
        const keysSpy = jest.spyOn(Object, "keys");
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        };

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
        };
        jest.spyOn(Object, "keys").mockReturnValueOnce([1, 2, 3]);

        // Act
        const result = keys(obj);

        // Assert
        expect(result).toEqual([1, 2, 3]);
    });
});
