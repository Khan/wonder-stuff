// @flow
import {
    extractHashFromFileName,
    localizeString,
    localizeFile,
    hashFileContents,
} from "../localize-file.js";

describe("hashFileContents", () => {
    it("produces a 20-char hash of a string", () => {
        // Arrange
        const contents = "Khan Academy";

        // Act
        const hash = hashFileContents(contents);

        // Assert
        expect(hash).toEqual("a95b436b6afe17af8b20");
    });
});

describe("extractHashFromFileName", () => {
    it("extracts a hash from the filename", () => {
        // Arrange
        const fileName = "runtime.deadbeefc0ffeec0ffee.js";

        // Act
        const hash = extractHashFromFileName(fileName);

        // Assert
        expect(hash).toEqual("deadbeefc0ffeec0ffee");
    });

    it("ignores shorter hashes in the filename", () => {
        // Arrange
        const fileName = "runtime.deadbeef.js";

        // Act
        const hash = extractHashFromFileName(fileName);

        // Assert
        expect(hash).toEqual(undefined);
    });

    it("ignores longer hashes in the filename", () => {
        // Arrange
        const fileName = "runtime.deadbeefc0ffeec0ffeec0ffee.js";

        // Act
        const hash = extractHashFromFileName(fileName);

        // Assert
        expect(hash).toEqual(undefined);
    });

    it("ignores files with no hash in them", () => {
        // Arrange
        const fileName = "runtime.js";

        // Act
        const hash = extractHashFromFileName(fileName);

        // Assert
        expect(hash).toEqual(undefined);
    });
});

describe("localizeString", () => {
    it("replaces /prod/en", () => {
        // Arrange
        const locale = "es";
        const content = "A simple path: /genwebpack/prod/en/foo.js";
        const hashMap = {};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual("A simple path: /genwebpack/prod/es/foo.js");
    });

    it("replaces multiple /prod/en", () => {
        // Arrange
        const locale = "es";
        const content = "/genwebpack/prod/en/a.js /genwebpack/prod/en/b.js";
        const hashMap = {};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/a.js /genwebpack/prod/es/b.js",
        );
    });

    it("leaves other prod paths intact", () => {
        // Arrange
        const locale = "es";
        const content = "/genwebpack/prod/pt/a.js /genwebpack/prod/hu/b.js";
        const hashMap = {};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/pt/a.js /genwebpack/prod/hu/b.js",
        );
    });

    it("updates a hash in a file name and updates locale", () => {
        // Arrange
        const locale = "es";
        const content = "/genwebpack/prod/en/foo.3e083afe95f447481cad.js";
        const hashMap = {
            "3e083afe95f447481cad": "593cff1d8e1e383f2471",
        };
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/foo.593cff1d8e1e383f2471.js",
        );
    });

    it("updates multiple hashes and locales", () => {
        // Arrange
        const locale = "es";
        const content =
            "/genwebpack/prod/en/foo.3e083afe95f447481cad.js /genwebpack/prod/en/foo.29d70669460257a74073.js";
        const hashMap = {
            "3e083afe95f447481cad": "593cff1d8e1e383f2471",
            "29d70669460257a74073": "9e0f5e0d0704dd61ee2f",
        };
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/foo.593cff1d8e1e383f2471.js /genwebpack/prod/es/foo.9e0f5e0d0704dd61ee2f.js",
        );
    });

    it("ignores unknown hashes", () => {
        // Arrange
        const locale = "es";
        const content =
            "/genwebpack/prod/en/foo.ae083afe95f447481cad.js /genwebpack/prod/en/foo.a9d70669460257a74073.js";
        const hashMap = {
            "3e083afe95f447481cad": "593cff1d8e1e383f2471",
            "29d70669460257a74073": "9e0f5e0d0704dd61ee2f",
        };
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/foo.ae083afe95f447481cad.js /genwebpack/prod/es/foo.a9d70669460257a74073.js",
        );
    });

    it("ignores embedded hashes", () => {
        // Arrange
        const locale = "es";
        const content =
            "/genwebpack/prod/en/foo.a3e083afe95f447481cad.js /genwebpack/prod/en/foo.29d70669460257a74073b.js";
        const hashMap = {
            "3e083afe95f447481cad": "593cff1d8e1e383f2471",
            "29d70669460257a74073": "9e0f5e0d0704dd61ee2f",
        };
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({
            locale,
            content,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/foo.a3e083afe95f447481cad.js /genwebpack/prod/es/foo.29d70669460257a74073b.js",
        );
    });

    it("updates locale but leaves hashes if no hashMap is provided", () => {
        // Arrange
        const locale = "es";
        const content = "/genwebpack/prod/en/foo.3e083afe95f447481cad.js";
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const newContent = localizeString({locale, content, getLocalePath});

        // Assert
        expect(newContent).toEqual(
            "/genwebpack/prod/es/foo.3e083afe95f447481cad.js",
        );
    });
});

describe("localizeFile", () => {
    it("localizes the runtime file contents and updates the hashMap", () => {
        // Arrange
        const content = "genwebpack/prod/en/file.2e083afe95f447481cad.js";
        const oldHash = "3e083afe95f447481cad";
        const locale = "es";
        const hashMap = {"2e083afe95f447481cad": "4e083afe95f447481cad"};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const results = localizeFile({
            content,
            oldHash,
            locale,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(results).toEqual(
            "genwebpack/prod/es/file.4e083afe95f447481cad.js",
        );
        expect(hashMap).toEqual({
            "2e083afe95f447481cad": "4e083afe95f447481cad",
            "3e083afe95f447481cad": "b4a6a6e27adba7babb17",
        });
    });

    it("localizes the chunk-map file contents and updates the hashMap", () => {
        // Arrange
        const content = "genwebpack/prod/en/file.2e083afe95f447481cad.js";
        const oldHash = "3e083afe95f447481cad";
        const locale = "es";
        const hashMap = {"2e083afe95f447481cad": "4e083afe95f447481cad"};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const result = localizeFile({
            content,
            oldHash,
            locale,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(result).toEqual(
            "genwebpack/prod/es/file.4e083afe95f447481cad.js",
        );
        expect(hashMap).toEqual({
            "2e083afe95f447481cad": "4e083afe95f447481cad",
            "3e083afe95f447481cad": "b4a6a6e27adba7babb17",
        });
    });

    it("localizes the runtime file contents and updates the hashMap w/ an existing hashMap mapping", () => {
        // Arrange
        const content = "genwebpack/prod/en/file.2e083afe95f447481cad.js";
        const oldHash = "3e083afe95f447481cad";
        const locale = "es";
        const hashMap = {
            "2e083afe95f447481cad": "4e083afe95f447481cad",
            c0ffee: "3e083afe95f447481cad",
        };
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const result = localizeFile({
            content,
            oldHash,
            locale,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(result).toEqual(
            "genwebpack/prod/es/file.4e083afe95f447481cad.js",
        );
        expect(hashMap).toEqual({
            "2e083afe95f447481cad": "4e083afe95f447481cad",
            "3e083afe95f447481cad": "b4a6a6e27adba7babb17",
            c0ffee: "b4a6a6e27adba7babb17",
        });
    });

    it("localizes the manifest file contents", () => {
        // Arrange
        const content = "genwebpack/prod/en/file.2e083afe95f447481cad.js";
        const oldHash = null;
        const locale = "es";
        const hashMap = {"2e083afe95f447481cad": "4e083afe95f447481cad"};
        const getLocalePath = (locale: string) => `/prod/${locale}/`;

        // Act
        const result = localizeFile({
            content,
            oldHash,
            locale,
            hashMap,
            getLocalePath,
        });

        // Assert
        expect(result).toEqual(
            "genwebpack/prod/es/file.4e083afe95f447481cad.js",
        );
        expect(hashMap).toEqual({
            "2e083afe95f447481cad": "4e083afe95f447481cad",
        });
    });
});
