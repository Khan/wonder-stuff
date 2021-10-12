// @flow

/**
 * @typedef {Object} Errors A base error taxonomy for consumers of this core
 * library to build off.
 *
 * @property {string} Unknown The kind of error is not known.
 */

/**
 * @type {Errors} A base error taxonomy.
 */
export const Errors = Object.freeze({
    Unknown: "Unknown",
});
