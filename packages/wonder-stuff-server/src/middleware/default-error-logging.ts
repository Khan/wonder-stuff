import expressWinston from "express-winston";

// @ts-expect-error - TS2305 - Module '"express"' has no exported member 'Middleware'. | TS2724 - '"express"' has no exported member named '$Request'. Did you mean 'Request'? | TS2724 - '"express"' has no exported member named '$Response'. Did you mean 'Response'?
import type {Middleware, Request, Response} from "express";
import type {Logger} from "../types";

/**
 * Create middleware for reporting errors.
 */
export const defaultErrorLogging = <TReq extends Request, TRes extends Response>(logger: Logger): Middleware<TReq, TRes> => /**
 * Express-winston types aren't parameterized, so we suppress the error.
 */
expressWinston.errorLogger({
    level: "error",
    winstonInstance: logger,
});
