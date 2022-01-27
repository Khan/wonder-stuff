// @flow
import {isolateModules} from "../isolate-modules.js";
import * as AssertJest from "../internal/assert-jest.js";

jest.mock("../internal/assert-jest.js");

describe("#isolateModules", () => {
    it("should assert we are in jest", () => {
        // Arrange
        const assertJestSpy = jest.spyOn(AssertJest, "assertJest");

        // Act
        isolateModules(() => {});

        // Assert
        expect(assertJestSpy).toHaveBeenCalledTimes(1);
    });

    it("should execute the given function", () => {
        // Arrange
        const action = jest.fn();

        // Act
        isolateModules(action);

        // Assert
        expect(action).toHaveBeenCalled();
    });

    it("should return the result of the given function", () => {
        // Arrange
        const action = jest.fn(() => "result");

        // Act
        const result = isolateModules(action);

        // Assert
        expect(result).toEqual("result");
    });

    it("should isolate module imports inside the executed code from existing imports", async () => {
        // Arrange

        // Act
        const result = isolateModules(() => require("../isolate-modules.js"));

        // Assert
        expect(result).not.toBe(isolateModules);
    });

    it("should isolate module imports inside the executed code from other isolated imports", async () => {
        // Arrange
        const module1 = isolateModules(() => require("../isolate-modules.js"));

        // Act
        const result = isolateModules(() => require("../isolate-modules.js"));

        // Assert
        expect(module1).not.toBe(result);
    });
});
