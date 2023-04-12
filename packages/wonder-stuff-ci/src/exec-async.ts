import {exec} from "child_process";
import util from "util";

/**
 * A simple promisified version of child_process.exec, so we can `await` it
 */
export const execAsync = util.promisify(exec);
