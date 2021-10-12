// @flow

/**
 * @typedef {Object} Errors A base error taxonomy for consumers of this core
 * library to build off.
 *
 * @property {ErrorKind} Unknown The kind of error is not known.
 */

/**
 * @type {Errors} A base error taxonomy.
 */
export const Errors = Object.freeze({
    Unknown: ("Unknown": ErrorKind),
});

/**
 * What kind of error is being reported.
 */
export type ErrorKind = $Values<typeof Errors>;
