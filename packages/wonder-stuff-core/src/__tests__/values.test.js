// @flow
import {values} from "../values";

describe("#values", () => {
    it("should call Object.values with the given object", () => {
        // Arrange
        const valuesSpy = jest.spyOn(Object, "values");
        const obj = {
            a: 1,
            b: "2",
            c: [3, 4],
        };

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
        };
        jest.spyOn(Object, "values").mockReturnValue("THE RESULT");

        // Act
        const result = values(obj);

        // Assert
        expect(result).toEqual("THE RESULT");
    });
});
