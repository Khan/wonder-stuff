import {keys} from "../keys";

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
        jest.spyOn(Object, "keys").mockReturnValueOnce(["THE RESULT"]);

        // Act
        const result = keys(obj);

        // Assert
        expect(result).toEqual(["THE RESULT"]);
    });
});
