/**
 * @typedef {Object} Errors A base error taxonomy for consumers of this core
 * library to build off.
 *
 * @property {string} Unknown The kind of error is not known.
 * @property {string} Internal The error is internal to the executing code.
 * @property {string} InvalidInput There was a problem with the provided input,
 * such as the wrong format or a null value.
 * @property {string} InvalidUse The error is down an improper use of the
 * invoked code.
 */

/**
 * @type {Errors} A base error taxonomy.
 */
export const Errors = Object.freeze({
    Unknown: "Unknown",
    Internal: "Internal",
    InvalidInput: "InvalidInput",
    InvalidUse: "InvalidUse",
});
