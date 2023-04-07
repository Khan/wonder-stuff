/**
 * A simple promisified version of child_process.exec, so we can `await` it
 */
import {exec, ExecOptions} from "child_process";
import util from "util";

export const bufferToString = (input: Buffer | string): string => {
    if (typeof input === "string") {
        return input;
    } else {
        return input.toString("utf8");
    }
};

export const execProm = util.promisify(exec);

export default execProm;
