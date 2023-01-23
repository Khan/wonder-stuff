import expressWinston from "express-winston";

// @ts-expect-error - TS2305 - Module '"express"' has no exported member 'Middleware'.
import type {Middleware, Request, Response} from "express";
import type {Logger} from "../types";

/**
 * Create middleware for tracking requests.
 */
export const defaultRequestLogging = <TReq extends Request, TRes extends Response>(logger: Logger): Middleware<TReq, TRes> => /**
 * We use express-winston to log requests for us.
 */
expressWinston.logger({
    /**
     * Specify the level that this logger logs at.
     * (use a function to dynamically change level based on req and res)
     *     `function(req, res) { return String; }`
     */
    level: "info",

    /**
     * Use the logger we already set up.
     */
    winstonInstance: logger,
    expressFormat: true,
    colorize: true,
    meta: false,
});
