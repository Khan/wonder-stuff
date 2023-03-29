// @flow

/**
 * Utilities for reading secrets from secrets files.
 */
import fs from "fs";
import {promisify} from "util";

/**
 * Read file.
 *
 * This is an abstraction that aids testing by providing a mockable function
 * call that is less likely to break test infrastructure (unlike mocking
 * the fs module).
 */
export const readFile: (filePath: string) => Promise<Buffer> = promisify(
    fs.readFile,
);
