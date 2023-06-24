/* eslint-disable no-console */
import {exec} from "child_process";

/**
 * Options for running a command.
 */
type Options = {
    /**
     * The arguments to pass to the command.
     */
    args?: Array<string>;

    /**
     * The current working directory to run the command in.
     */
    cwd?: string;
};

/**
 * Run a comamnd.
 *
 * @param cmd The command to run.
 * @param options The options to pass to the command.
 * @returns A promise that resolves with the output of the command.
 */
export function runCommand(cmd: string, options?: Options): Promise<string> {
    const args = options?.args ?? [];
    return new Promise((resolve, reject) => {
        exec(
            [cmd, ...args].join(" "),
            {
                cwd: options?.cwd ?? process.cwd(),
                env: process.env,
            },
            (err, stdout) => {
                if (err && err.code) {
                    reject(err);
                } else {
                    resolve(stdout);
                }
            },
        );
    });
}
