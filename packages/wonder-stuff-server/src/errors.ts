import {Errors as CoreErrors} from "@khanacademy/wonder-stuff-core";

/**
 * @typedef {Object} Errors The different errors in our error taxononomy.
 *
 * @property {string} Unknown The kind of error is not known.
 *
 * @property {string} Internal The error is internal to the executing code.
 *
 * @property {ErrorKind} InvalidInput There was a problem with provided input,
 * such as the wrong format or a null value. This indicates inputs that are
 * problematic regardless of the state of the system. If the input was valid
 * but caused problems anyway consider {@link NotAllowed}.
 *
 * @property {string} InvalidUse The error is down an improper use of the
 * invoked code.
 *
 * @property {ErrorKind} NotFound A resource was not found. If the resource
 * couldn't be retrieved due to access control use {@link Unauthorized}
 * instead. If the resource couldn't be found because the input was invalid use
 * {@link InvalidInput} instead.
 *
 *
 * @property {ErrorKind} NotAllowed There was a problem due to the state of the
 * system not matching the requested operation or input. For example, trying to
 * create a username that is valid, but is already taken by another user. Use
 * {@link InvalidInput} instead when the input isn't valid regardless of
 * the state of the system. Use {@link NotFound} when the failure is due
 * to not being able to find a resource.
 *
 * @property {ErrorKind} Unauthorized There was an access control problem
 *
 * @property {ErrorKind} NotImplemented The function isn't implemented
 *
 * @property {ErrorKind} TransientService There was a problem when making a
 * request to a non-Khan service, e.g. datastore that might be resolvable by
 * retrying.
 *
 * @property {ErrorKind} Service There was a non-transient problem when making
 * a request to a non-Khan service, e.g. datastore.
 */

/**
 * @type {Errors} A base server error taxonomy.
 */
export const Errors = Object.freeze({
    ...CoreErrors,
    TransientService: "TransientService",
    Service: "Service",
});
