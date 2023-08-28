import {afterEachRestoreEnv} from "../after-each-restore-env";

jest.mock("../internal/jest-wrappers");

describe("#afterEachRestoreEnv", () => {
    const EXISTS_1 = process.env.EXISTS_1;
    const EXISTS_2 = process.env.EXISTS_2;

    const ABSENT_1 = process.env.ABSENT_1;
    const ABSENT_2 = process.env.ABSENT_2;

    afterEach(() => {
        // In case our tests misbehave, we still want to be good test denizens
        // so we restore the environment variables we changed without using the
        // code under test.
        if (EXISTS_1 === undefined) {
            delete process.env.EXISTS_1;
        } else {
            process.env.EXISTS_1 = EXISTS_1;
        }

        if (EXISTS_2 === undefined) {
            delete process.env.EXISTS_2;
        } else {
            process.env.EXISTS_2 = EXISTS_2;
        }

        if (ABSENT_1 === undefined) {
            delete process.env.ABSENT_1;
        } else {
            process.env.ABSENT_1 = ABSENT_1;
        }

        if (ABSENT_2 === undefined) {
            delete process.env.ABSENT_2;
        } else {
            process.env.ABSENT_2 = ABSENT_2;
        }
    });

    it("should register an afterEach callback", () => {
        // Arrange
        const afterEachSpy = jest
            .spyOn(global, "afterEach")
            .mockImplementationOnce(() => {});

        // Act
        afterEachRestoreEnv("FOO");

        // Assert
        expect(afterEachSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    describe("function passed to afterEach", () => {
        it("should restore changed environment variables to their original values", () => {
            // Arrange
            const afterEachSpy = jest
                .spyOn(global, "afterEach")
                .mockImplementationOnce(() => {});

            // Make sure the env vars exist.
            process.env.EXISTS_1 = "exists-1";
            process.env.EXISTS_2 = "exists-2";

            // Act
            // Capture the state and set up the callback.
            afterEachRestoreEnv();
            const afterEachCallback: any = afterEachSpy.mock.calls.at(-1)?.[0];
            // Change the state.
            process.env.EXISTS_1 = "exists-1-changed";
            process.env.EXISTS_2 = "exists-2-changed";
            // Restore the state.
            afterEachCallback();
            const result = [process.env.EXISTS_1, process.env.EXISTS_2];

            // Assert
            expect(result).toEqual(["exists-1", "exists-2"]);
        });

        it("should delete environment variables that were not set before", () => {
            // Arrange
            const afterEachSpy = jest
                .spyOn(global, "afterEach")
                .mockImplementationOnce(() => {});

            // Make sure the env vars don't exist.
            delete process.env.ABSENT_1;
            delete process.env.ABSENT_2;

            // Act
            // Capture the state and set up the callback.
            afterEachRestoreEnv();
            const afterEachCallback: any = afterEachSpy.mock.calls.at(-1)?.[0];
            // Change the state.
            process.env.ABSENT_1 = "absent-1-set";
            process.env.ABSENT_2 = "absent-2-set";
            // Restore the state.
            afterEachCallback();
            const result = [process.env.ABSENT_1, process.env.ABSENT_2];

            // Assert
            expect(result).toEqual([undefined, undefined]);
        });

        it("should only restore the variables it was asked to restore", () => {
            // Arrange
            const afterEachSpy = jest
                .spyOn(global, "afterEach")
                .mockImplementationOnce(() => {});

            // Make sure the env vars don't exist or exist as we want.
            process.env.EXISTS_1 = "exists-1";
            process.env.EXISTS_2 = "exists-2";
            delete process.env.ABSENT_1;
            delete process.env.ABSENT_2;

            // Act
            // Capture the state and set up the callback.
            afterEachRestoreEnv("ABSENT_1", "EXISTS_1");
            const afterEachCallback: any = afterEachSpy.mock.calls.at(-1)?.[0];
            // Change the state.
            process.env.EXISTS_1 = "exists-1-changed";
            process.env.EXISTS_2 = "exists-2-changed";
            process.env.ABSENT_1 = "absent-1-set";
            process.env.ABSENT_2 = "absent-2-set";
            // Restore the state.
            afterEachCallback();
            const result = [
                process.env.EXISTS_1,
                process.env.EXISTS_2,
                process.env.ABSENT_1,
                process.env.ABSENT_2,
            ];

            // Assert
            expect(result).toEqual([
                "exists-1",
                "exists-2-changed",
                undefined,
                "absent-2-set",
            ]);
        });
    });
});
