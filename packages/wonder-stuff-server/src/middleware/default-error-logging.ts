import * as expressWinston from "express-winston";

import type {ErrorRequestHandler} from "express";
import type {Logger} from "../types";

/**
 * Create a request handler for reporting errors.
 */
export const defaultErrorLogging = (logger: Logger): ErrorRequestHandler =>
    /**
     * Express-winston types aren't parameterized, so we suppress the error.
     */
    expressWinston.errorLogger({
        level: "error",
        winstonInstance: logger,
    });
