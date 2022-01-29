// @flow
import {wait, waitForAnimationFrame} from "../wait.js";
import * as VerifyRealTimers from "../internal/verify-real-timers.js";
import * as UnverifiedWait from "../internal/unverified-wait.js";

jest.mock("../internal/assert-jest.js");
jest.mock("../internal/verify-real-timers.js");
jest.mock("../internal/unverified-wait.js");

describe("wait.js", () => {
    describe("#wait", () => {
        it("should verify if jest.useRealTimers or not", async () => {
            // Arrange
            const verifyRealTimersSpy = jest.spyOn(
                VerifyRealTimers,
                "verifyRealTimers",
            );

            // Act
            await wait();

            // Assert
            expect(verifyRealTimersSpy).toHaveBeenCalled();
        });

        it("should wait for the given delay, count times", async () => {
            // Arrange
            const unverifiedWaitSpy = jest.spyOn(
                UnverifiedWait,
                "unverifiedWait",
            );

            // Act
            await wait({delay: 10, count: 42});

            // Assert
            expect(unverifiedWaitSpy).toHaveBeenCalledWith(10, 42);
        });

        it("should normalize delay to always be at least 0", async () => {
            // Arrange
            const unverifiedWaitSpy = jest
                .spyOn(UnverifiedWait, "unverifiedWait")
                .mockResolvedValue();

            // Act
            await wait({delay: -1});

            // Assert
            expect(unverifiedWaitSpy).toHaveBeenCalledWith(0, 1);
        });

        it("should normalize count to always be at least 1", async () => {
            // Arrange
            const unverifiedWaitSpy = jest
                .spyOn(UnverifiedWait, "unverifiedWait")
                .mockResolvedValue();

            // Act
            await wait({count: 0});

            // Assert
            expect(unverifiedWaitSpy).toHaveBeenCalledWith(0, 1);
        });
    });

    describe("#waitForAnimationFrame", () => {
        it("should verify if jest.useRealTimers or not", () => {
            // Arrange
            const verifyRealTimersSpy = jest.spyOn(
                VerifyRealTimers,
                "verifyRealTimers",
            );

            // Act
            waitForAnimationFrame();

            // Assert
            expect(verifyRealTimersSpy).toHaveBeenCalled();
        });

        it("should wait once for the animation frame duration", async () => {
            // Arrange
            const unverifiedWaitSpy = jest
                .spyOn(UnverifiedWait, "unverifiedWait")
                .mockResolvedValue();

            // Act
            await waitForAnimationFrame();

            // Assert
            expect(unverifiedWaitSpy).toHaveBeenCalledWith(17, 1);
        });
    });
});
