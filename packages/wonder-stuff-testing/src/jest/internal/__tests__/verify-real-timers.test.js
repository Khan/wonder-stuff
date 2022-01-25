/* eslint-disable no-console */
// @flow
import {verifyRealTimers} from "../verify-real-timers.js";

describe("#verifyRealTimers", () => {
    it("should throw when jest.useFakeTimers", () => {
        // Arrange
        jest.useFakeTimers();

        // Act
        const underTest = () => verifyRealTimers();

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Cannot use wait() with fake timers. Call jest.useRealTimers() in test case or in a beforeEach."`,
        );
    });

    it("should not throw when jest.useRealTimers", () => {
        // Arrange
        jest.useRealTimers();

        // Act
        const underTest = () => verifyRealTimers();

        // Assert
        expect(underTest).not.toThrow();
    });

    it("should not invoke a spied on console.warn for the test case", () => {
        // Arrange
        jest.useRealTimers();
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        // Act
        verifyRealTimers();

        // Assert
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should not override console.warn for the test case", () => {
        // Arrange
        jest.useRealTimers();
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});

        // Act
        console.warn("before");
        verifyRealTimers();
        console.warn("after");

        // Assert
        expect(warnSpy).toHaveBeenCalledTimes(2);
        expect(warnSpy).toHaveBeenCalledWith("before");
        expect(warnSpy).toHaveBeenCalledWith("after");
    });
});
