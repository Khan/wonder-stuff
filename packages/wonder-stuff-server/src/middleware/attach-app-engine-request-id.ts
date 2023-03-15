import type {Response, Request, Handler, NextFunction} from "express";
import {getRequestLogger} from "../get-request-logger";
import type {Logger, RequestWithLog} from "../types";
import {getAppEngineRequestID} from "../get-app-engine-request-id";

/**
 * Middleware that sets the log property of a request to a logger
 * that will attach the GAE requestID to the log metadata.
 */
export function attachAppEngineRequestID(defaultLogger: Logger): Handler {
    return (
        req: RequestWithLog<Request>,
        res: Response,
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
         * NOTE: the Request type doesn't have a log field, officially.
         * However, we know that the Google middleware adds it, so now we
         * replace it with our own version.
         */
        req.log = requestIDLog;
        next();
    };
}
