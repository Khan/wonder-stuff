import "jest-extended";

describe("index.js", () => {
    it("should export what we expect it to export", async () => {
        // Arrange
        const importedModule = import("../index");

        // Act
        const result = await importedModule;

        // Assert
        expect(result).toContainAllKeys([
            "runServer",
            "extractError",
            "Requests",
        ]);
    });

    it("should export Requests API", async () => {
        // Arrange
        const importedModule = import("../index");

        // Act
        const {Requests: result} = await importedModule;

        // Assert
        expect(result).toContainAllKeys(["request", "DefaultRequestOptions"]);
    });
});
