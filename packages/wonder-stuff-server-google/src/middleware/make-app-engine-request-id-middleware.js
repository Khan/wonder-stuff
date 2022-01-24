// @flow
import type {$Response, $Request, Middleware, NextFunction} from "express";
import {getAppEngineRequestID} from "../get-app-engine-request-id.js";
import {getRequestLogger} from "../get-request-logger.js";
import type {Logger, RequestWithLog} from "../types.js";

/**
 * Create a middleware that sets the log property of a request to a logger
 * that will attach the GAE requestID to the log metadata.
 */
export function makeAppEngineRequestIDMiddleware<
    TReq: RequestWithLog<$Request>,
    TRes: $Response,
>(defaultLogger: Logger): Middleware<TReq, TRes> {
    const middleware = <TReq: RequestWithLog<$Request>, TRes: $Response>(
        req: TReq,
        res: TRes,
        next: NextFunction,
    ): void => {
        const requestID = getAppEngineRequestID(req);
        if (requestID == null) {
            // We couldn't get the GAE request ID, so let's skip on.
            next();
            return;
        }

        /**
         * We have a requestID and we know req.log exists, so let's set
         * req.log to a derived child logger that adds the requestID metadata.
         */
        const requestIDLog = getRequestLogger(defaultLogger, req).child({
            requestID,
        });
        /*
         * NOTE: the $Request type doesn't have a log field, officially.
         * However, we know that the Google middleware adds it, so now we
         * replace it with our own version.
         */
        req.log = requestIDLog;
        next();
    };
    return middleware;
}
