import express from "express";
import type {Application, Request, Response} from "express";
import {Runtime} from "@khanacademy/wonder-stuff-server";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import * as lw from "@google-cloud/logging-winston";
import {makeAppEngineRequestIDMiddleware} from "./middleware/make-app-engine-request-id-middleware";

/**
 * Apply the middleware that we want to use with Google App Engine (GAE).
 */
export async function addAppEngineMiddleware<TReq extends Request, TRes extends Response>(
    app: Application,
    mode: typeof Runtime[keyof typeof Runtime],
    logger: Logger,
): Promise<Application> {
// @ts-expect-error - TS2558 - Expected 0 type arguments, but got 2.
    const middlewareApp = express<TReq, TRes>();

    /**
     * If we're in production, we use the logging-winston middleware from
     * Google Cloud.
     */
    if (mode === Runtime.Production) {
        middlewareApp.use(await lw.express.makeMiddleware(logger));
    }

    return (
        middlewareApp
            // Ensure the requestID is added to the logging metadata.
            .use(makeAppEngineRequestIDMiddleware(logger))
            // Add the app.
            .use(app)
    );
}
