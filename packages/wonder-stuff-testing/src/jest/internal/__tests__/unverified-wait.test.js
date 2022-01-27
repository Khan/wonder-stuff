// @flow
import {unverifiedWait} from "../unverified-wait.js";

describe("#unverifiedWait", () => {
    const RealPromise = global.Promise;
    beforeEach(() => {
        jest.useRealTimers();
    });

    afterEach(() => {
        global.Promise = RealPromise;
    });

    it("should invoke setTimeout with the given delay", async () => {
        // Arrange
        const setTimeoutSpy = jest
            .spyOn(global, "setTimeout")
            .mockImplementation((fn) => fn());

        // Act
        await unverifiedWait(42, 1);

        // Assert
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 42);
    });

    it("should invoke setTimeout count times", async () => {
        // Arrange
        const setTimeoutSpy = jest
            .spyOn(global, "setTimeout")
            .mockImplementation((fn) => fn());

        // Act
        await unverifiedWait(1, 42);

        // Assert
        expect(setTimeoutSpy).toHaveBeenCalledTimes(42);
    });

    it("should resolve one promise per count", async () => {
        // Arrange
        jest.spyOn(global, "setTimeout").mockImplementation((fn) => fn());

        const countResolves = jest.fn();
        global.Promise = jest.fn().mockImplementation((fn) => {
            return new RealPromise((resolve, reject) => {
                const countedResolve = () => {
                    countResolves();
                    resolve();
                };
                fn(countedResolve, reject);
            });
        });

        // Act
        await unverifiedWait(1, 42);

        // Assert
        expect(countResolves).toHaveBeenCalledTimes(42);
    });
});
