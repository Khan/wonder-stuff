import type {Request} from "express";
import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "./errors";
import type {Logger, RequestWithLog} from "./types";

/**
 * Get the logger associated with the given request.
 *
 * If there is a request log, it is returned, otherwise the default logger is
 * returned. If both do not exist, an error is thrown.
 */
export const getRequestLogger = <TReq extends RequestWithLog<Request>>(
    defaultLogger?: Logger | null,
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
