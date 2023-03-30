describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["JSDOM"]);
    });

    it("should export JSDOM pieces", async () => {
        // Arrange
        const importedModule = import("../index");

        // Act
        const {JSDOM: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "Configuration",
            "Environment",
            "ResourceLoader",
            "FileResourceLoader",
        ]);
    });
});
