/**
 * A simple promisified version of child_process.exec, so we can `await` it
 */
import {exec, ExecOptions} from "child_process";

export const bufferToString = (input: Buffer | string): string => {
    if (typeof input === "string") {
        return input;
    } else {
        return input.toString("utf8");
    }
};

export const execProm = (
    command: string,
    rejectOnError: boolean,
    options?: ExecOptions,
): Promise<{
    err: Error | null | undefined;
    stdout: string;
    stderr: string;
}> =>
    new Promise((res, rej) =>
        exec(command, options, (err, stdout, stderr) =>
            err
                ? rejectOnError
                    ? rej(err)
                    : res({
                          err,
                          stdout: bufferToString(stdout),
                          stderr: bufferToString(stderr),
                      })
                : res({
                      err: null,
                      stdout: bufferToString(stdout),
                      stderr: bufferToString(stderr),
                  }),
        ),
    );

export default execProm;
