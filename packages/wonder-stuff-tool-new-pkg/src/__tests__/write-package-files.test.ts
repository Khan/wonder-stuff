import path from "node:path";
import os from "node:os";
import fs from "node:fs";
import {writePackageFiles} from "../write-package-files";

import * as generatePackageJsonModule from "../generate-package-json";
import * as generateReadmeModule from "../generate-readme.md";
import * as generateIndexJSModule from "../generate-index-js";

describe("#writePackageFiles", () => {
    const tempDirs: Array<string> = [];

    afterEach(() => {
        const dirsToDelete = tempDirs.splice(0, tempDirs.length);
        dirsToDelete.forEach((dir) => fs.rmSync(dir, {recursive: true}));
    });

    async function makeTempDirAndWritePackageFiles() {
        // Arrange
        const tempDir = fs.mkdtempSync(
            path.join(os.tmpdir(), "write-package-files-tests-"),
        );

        const localName = crypto.randomUUID();
        const packageName = `@khan/${localName}`;

        // Act
        await writePackageFiles(tempDir, packageName, `Khan/repo-${localName}`);

        return {localName, tempDir};
    }

    it.each(["package.json", "README.md", "index.js"])(
        "should write '%s' to the working directory",
        async (filename) => {
            // Arrange

            // Act
            const {tempDir} = await makeTempDirAndWritePackageFiles();

            // Assert
            expect(fs.readdirSync(tempDir)).toContain(filename);
        },
    );

    it("should populate the package.json with the result of generatePackageJson()", async () => {
        // Arrange
        jest.spyOn(
            generatePackageJsonModule,
            "generatePackageJson",
        ).mockReturnValue("Hello");

        // Act
        const {localName, tempDir} = await makeTempDirAndWritePackageFiles();

        // Assert
        expect(
            fs.readFileSync(path.join(tempDir, "package.json")).toString(),
        ).toEqual("Hello");
    });

    it("should populate the README.md with the result of generateReadme()", async () => {
        // Arrange
        jest.spyOn(generateReadmeModule, "generateReadme").mockReturnValue(
            "# README",
        );

        // Act
        const {localName, tempDir} = await makeTempDirAndWritePackageFiles();

        // Assert
        expect(
            fs.readFileSync(path.join(tempDir, "README.md")).toString(),
        ).toEqual("# README");
    });

    it("should populate the index.js with the result of generateIndexJs()", async () => {
        // Arrange
        jest.spyOn(generateIndexJSModule, "generateIndexJs").mockReturnValue(
            "const x = 1;",
        );

        // Act
        const {localName, tempDir} = await makeTempDirAndWritePackageFiles();

        // Assert
        expect(
            fs.readFileSync(path.join(tempDir, "index.js")).toString(),
        ).toEqual("const x = 1;");
    });
});
