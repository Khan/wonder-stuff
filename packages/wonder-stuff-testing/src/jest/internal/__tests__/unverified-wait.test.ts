import {unverifiedWait} from "../unverified-wait";

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
            .mockImplementation((fn: any) => fn());

        // Act
        await unverifiedWait(42, 1);

        // Assert
        expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 42);
    });

    it("should invoke setTimeout count times", async () => {
        // Arrange
        const setTimeoutSpy = jest
            .spyOn(global, "setTimeout")
            .mockImplementation((fn: any) => fn());

        // Act
        await unverifiedWait(1, 42);

        // Assert
        expect(setTimeoutSpy).toHaveBeenCalledTimes(42);
    });

    it("should resolve one promise per count", async () => {
        // Arrange
        jest.spyOn(global, "setTimeout").mockImplementation((fn: any) => fn());

        const countResolves = jest.fn();
        // @ts-expect-error [FEI-5011] - TS2740 - Type 'Mock<any, any, any>' is missing the following properties from type 'PromiseConstructor': all, race, reject, resolve, and 2 more.
        global.Promise = jest.fn().mockImplementation((fn: any) => {
            return new RealPromise((resolve: any, reject: any) => {
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
