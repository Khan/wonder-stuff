import type {Request, Response, NextFunction} from "express";
import {getLogger} from "../get-logger";

/**
 * Simple middleware that logs some info about the incoming request.
 *
 * We flatten the headers since they give us problems with exporting
 * our info logs to bigquery if we don't. The issue is that we end up
 * with a bigquery column per unique header name, and so we run out of
 * columns.
 */
export function logRequestInfo(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    const flattenedHeaders = Object.keys(req.headers).reduce(
        (headers, key) => headers + `${key}: ${req.headers[key]}\n`,
        "",
    );
    getLogger(req).info(`Request received: ${req.url}`, {
        allHeaders: flattenedHeaders,
        method: req.method,
        url: req.url,
    });

    next();
}
