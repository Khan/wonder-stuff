/* eslint-disable no-console */
// @flow
import {wait} from "../wait.js";

describe("#wait", () => {
    it("should throw immediately when jest.useFakeTimers", () => {
        // Arrange
        jest.useFakeTimers();

        // Act
        const underTest = () => wait();

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Cannot use wait() with fake timers. Call jest.useRealTimers() in test case or in a beforeEach."`,
        );
    });

    it("should resolve when jest.useRealTimers", async () => {
        // Arrange
        jest.useRealTimers();

        // Act
        const underTest = wait();

        // Assert
        await expect(underTest).resolves.toBeUndefined();
    });

    it("should not invoke a spied on console.warn for the test case", async () => {
        // Arrange
        jest.useRealTimers();
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        // Act
        await wait();

        // Assert
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should not override console.warn for the test case", async () => {
        // Arrange
        jest.useRealTimers();
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        // Act
        console.warn("before");
        await wait();
        console.warn("after");

        // Assert
        expect(warnSpy).toHaveBeenCalledTimes(2);
        expect(warnSpy).toHaveBeenCalledWith("before");
        expect(warnSpy).toHaveBeenCalledWith("after");
    });
});
