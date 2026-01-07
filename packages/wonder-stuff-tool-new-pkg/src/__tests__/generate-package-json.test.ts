import {generatePackageJson} from "../generate-package-json";

describe("#generatePackageJson", () => {
    it("should be valid JSON", () => {
        // Arrange

        // Act
        const packageJson = generatePackageJson("abc", "Test/repo-1");

        // Assert
        expect(() => JSON.parse(packageJson)).not.toThrow();
    });

    it("should populate the package.json content with given name", () => {
        // Arrange

        // Act
        const packageJson = generatePackageJson("abc", "Test/repo-1");

        // Assert
        expect(JSON.parse(packageJson)).toEqual(
            expect.objectContaining({
                name: "abc",
            }),
        );
    });

    it("should set publishConfig to public", () => {
        // Arrange

        // Act
        const packageJson = generatePackageJson("abc", "Test/repo-1");

        // Assert
        expect(JSON.parse(packageJson)).toEqual(
            expect.objectContaining({
                publishConfig: {access: "public"},
            }),
        );
    });
    it("should set repository field to match given repo", () => {
        // Arrange

        // Act
        const packageJson = generatePackageJson("abc", "Test/repo-1");

        // Assert
        expect(JSON.parse(packageJson)).toEqual(
            expect.objectContaining({
                repository: expect.objectContaining({
                    type: "git",
                    url: `git+https://github.com/Test/repo-1.git`,
                }),
            }),
        );
    });

    it("should set bugs url to match given repo", () => {
        // Arrange

        // Act
        const packageJson = generatePackageJson("abc", "Test/repo-1");

        // Assert
        expect(JSON.parse(packageJson)).toEqual(
            expect.objectContaining({
                bugs: expect.objectContaining({
                    url: `https://github.com/Test/repo-1/issues`,
                }),
            }),
        );
    });
});
