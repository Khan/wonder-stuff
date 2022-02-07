// @flow
import type {$Request} from "express";
import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "./errors.js";
import type {Logger, RequestWithLog} from "./types.js";

/**
 * Get the logger associated with the given request.
 *
 * If there is a request log, it is returned, otherwise the default logger is
 * returned. If both do not exist, an error is thrown.
 */
export const getRequestLogger = <TReq: RequestWithLog<$Request>>(
    defaultLogger: ?Logger,
    request?: TReq,
): Logger => {
    if (defaultLogger == null) {
        if (request == null || request.log == null) {
            throw new KindError("No logs available", Errors.Internal);
        }
        return request.log;
    }
    return request != null && request.log != null ? request.log : defaultLogger;
};
