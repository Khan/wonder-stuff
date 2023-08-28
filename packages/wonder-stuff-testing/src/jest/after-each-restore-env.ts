import {afterEach} from "./internal/jest-wrappers";

/**
 * Restore the values of the given environment variables after each test.
 *
 * This captures the values of the given environment variables on invocation
 * and then, after each test case, it restores those values.
 *
 * @param variableNames The names of the environment variables to restore.
 */
export const afterEachRestoreEnv = (
    ...variableNames: ReadonlyArray<string>
): void => {
    // We capture the current values on invocation.
    const originalValues = variableNames.reduce(
        (acc: Record<string, string | undefined>, variableName: string) => {
            acc[variableName] = process.env[variableName];
            return acc;
        },
        {},
    );

    /**
     * Restore the value of the given variable.
     */
    const restoreValue = (variableName: string, value: string | undefined) => {
        if (value === undefined) {
            delete process.env[variableName];
        } else {
            process.env[variableName] = value;
        }
    };

    // Now, in the afterEach call, we restore the environment state.
    afterEach(() => {
        for (const [variableName, value] of Object.entries(originalValues)) {
            restoreValue(variableName, value);
        }
    });
};
