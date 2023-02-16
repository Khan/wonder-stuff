import * as expressWinston from "express-winston";

import type {Handler} from "express";
import type {Logger} from "../types";

/**
 * Create a logger for tracking requests.
 */
export const defaultRequestLogging = (logger: Logger): Handler =>
    /**
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
