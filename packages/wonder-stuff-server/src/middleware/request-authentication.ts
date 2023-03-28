import type {Handler, Request, Response, NextFunction} from "express";
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";

import {getLogger} from "../get-logger";
import {getRuntimeMode} from "../get-runtime-mode";

import type {RequestAuthentication} from "../types.js";

function redactSecretHeader(req: Request, headerName: string): void {
    /**
     * We delete the header because we don't want it getting logged.
     */
    delete req.headers[headerName.toLowerCase()];
    /**
     * Let's make sure that secret is gone.
     */
    if (req.header(headerName) != null) {
        throw new KindError(
            "Secret header could not be redacted!",
            Errors.NotAllowed,
        );
    }
}

function makeProductionMiddleware(options: RequestAuthentication): Handler {
    /**
     * We look up the secret when the middleware is created. That means
     * that if the secret changes, the server needs to be
     * restarted/refreshed somehow.
     */
    const {secret, deprecatedSecret, headerName} = options;
    return function (req: Request, res: Response, next: NextFunction): void {
        const requestSecret = req.header(headerName);

        /**
         * We delete the header because we don't want it getting logged.
         * However, we need to be aware of the case to make sure we really do
         * delete it - headers are all lowercase in the express object.
         */
        redactSecretHeader(req, headerName);

        if (
            requestSecret !== String(secret) &&
            requestSecret !== String(deprecatedSecret)
        ) {
            res.status(401).send({error: "Missing or invalid secret"});
            return;
        }

        next();
    };
}

function makeDevelopmentMiddleware(options?: RequestAuthentication): Handler {
    /**
     * The secrets middleware is a noop when not in production.
     */
    return function (req: Request, res: Response, next: NextFunction): void {
        const logger = getLogger(req);
        if (options == null) {
            logger.debug("No authentication header configured.");
        } else if (req.header(options.headerName) == null) {
            // Let's log a message if the expected header is omitted. This is a
            // valid thing to do in dev since we don't authenticate dev
            // requests, but it is also useful to know during testing if the
            // header is missing.
            logger.warn("Authentication header was not included in request.", {
                header: options.headerName,
            });
        } else {
            /**
             * We delete the header because we don't want it getting logged.
             */
            redactSecretHeader(req, options.headerName);

            logger.debug(
                "Authentication header present but ignored in current runtime mode",
                {
                    header: options.headerName,
                },
            );
        }
        next();
    };
}

/**
 * Make the middleware to verify a request's authentication secret.
 *
 * This is a noop when not in production.
 *
 * When in production, this uses the configured header name
 * to identify the request header that it is to be matched against and then
 * matches it against the configured secret values.
 */
export function requestAuthentication(
    authenticationOptions?: RequestAuthentication,
): Handler {
    if (authenticationOptions != null && getRuntimeMode() === "production") {
        return makeProductionMiddleware(authenticationOptions);
    }
    return makeDevelopmentMiddleware(authenticationOptions);
}
