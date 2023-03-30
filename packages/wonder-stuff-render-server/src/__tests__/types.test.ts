describe("types.js", () => {
    it("should not export code", async () => {
        // Arrange
        const importedModule = import("../types");

        // Act
        const {default: result} = await importedModule;

        // Assert
        expect(Object.keys(result)).toHaveLength(0);
    });
});
