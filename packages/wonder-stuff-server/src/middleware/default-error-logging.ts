import expressWinston from "express-winston";

// @ts-expect-error [FEI-5011] - TS2305 - Module '"express"' has no exported member 'Middleware'.
import type {Middleware, Request, Response} from "express";
import type {Logger} from "../types";

/**
 * Create middleware for reporting errors.
 */
export const defaultErrorLogging = <
    TReq extends Request,
    TRes extends Response,
>(
    logger: Logger,
): Middleware<TReq, TRes>
/**
 * Express-winston types aren't parameterized, so we suppress the error.
 */ =>
    expressWinston.errorLogger({
        level: "error",
        winstonInstance: logger,
    });
