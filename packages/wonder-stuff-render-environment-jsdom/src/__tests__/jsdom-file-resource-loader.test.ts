import path from "path";
import * as JSDOM from "jsdom";

import * as ApplyAbortablePromisesPatch from "../apply-abortable-promises-patch";

import {JSDOMFileResourceLoader} from "../jsdom-file-resource-loader";

jest.mock("jsdom");
jest.mock("../apply-abortable-promises-patch");

describe("JSDOMFileResourceLoader", () => {
    describe("#constructor", () => {
        it("should invoke applyAbortablePromisesPatch before super()", () => {
            // Arrange
            const applyAbortablePromisesPatchSpy = jest.spyOn(
                ApplyAbortablePromisesPatch,
                "applyAbortablePromisesPatch",
            );
            const resourceLoaderSpy = jest.spyOn<any, any>(
                JSDOM,
                "ResourceLoader",
            );

            // Act
            // eslint-disable-next-line no-new
            new JSDOMFileResourceLoader(__dirname);

            // Assert
            expect(applyAbortablePromisesPatchSpy).toHaveBeenCalledBefore(
                resourceLoaderSpy,
            );
        });

        it("should throw if rootDir is omitted", () => {
            // Arrange

            // Act
            const underTest = () => new JSDOMFileResourceLoader(null as any);

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Root folder cannot be found"`,
            );
        });
    });

    describe("#fetch", () => {
        it.each([
            "http://example.com/__data__/file-loader-test.txt",
            "./__data__/file-loader-test.txt",
            path.normalize(
                path.join(__dirname, "./__data__/file-loader-test.txt"),
            ),
        ])("should read file", async (filePath: any) => {
            // Arrange
            const underTest = new JSDOMFileResourceLoader(__dirname);

            // Act
            const result: any = await underTest.fetch(filePath, {});

            // Assert
            expect(result).toBeInstanceOf(Buffer);
            expect(result.toString()).toBe(
                "THIS IS TEST CONTENT FOR THE SNAPSHOT!",
            );
        });
    });
});
