// @flow
export type {ErrorKind} from "./errors.js";

/**
 * A collection of data.
 */
export type Metadata = {
    +[name: string]: Metadata | string | number | boolean | null,
};
