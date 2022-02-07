// @flow
import type {$Request} from "express";
import {getRequestLogger} from "./get-request-logger.js";
import {getRootLogger} from "./root-logger.js";
import type {Logger, RequestWithLog} from "./types.js";

/**
 * Get the logger to use in the current context.
 *
 * When given a request, if that request has a log property, then that logger
 * is returned, otherwise the top-level logger instance is returned. This
 * provides a convenience so that the calling code does not need to know the
 * source of the logger.
 *
 * There is no need for things to knowingly request the top-level logger
 * as things that are logging should not care. However, in a case where there
 * is no request to use for context, it is equivalent to explicitly requesting
 * the top-level logger.
 */
export const getLogger = <TReq: RequestWithLog<$Request>>(
    request?: TReq,
): Logger => {
    const rootLogger = getRootLogger();
    return getRequestLogger(rootLogger, request);
};
