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
    // We capture the variables to restore. If none are given, we capture all.
    const restoreAll = variableNames.length === 0;
    const variablesToCapture = restoreAll
        ? Object.keys(process.env)
        : variableNames;
    // We capture the current values on invocation.
    const originalValues = variablesToCapture.reduce(
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
        // If we are restoriing all variables then we cannot rely solely on
        // what was captured, but instead we must also check what is currently
        // in the environment that was not captured to make sure we delete it.
        if (restoreAll) {
            for (const variableName of Object.keys(process.env)) {
                if (!(variableName in originalValues)) {
                    delete process.env[variableName];
                }
            }
        }

        for (const [variableName, value] of Object.entries(originalValues)) {
            restoreValue(variableName, value);
        }
    });
};
