// @flow
describe("index.js", () => {
    it("should log hello world on import", () => {
        // Arrange
        const spy = jest.spyOn(console, "log");

        // Act
        // eslint-disable-next-line import/no-unassigned-import
        require("../index.js");

        // Assert
        expect(spy).toHaveBeenCalledWith("Hello World!");
    });
});
