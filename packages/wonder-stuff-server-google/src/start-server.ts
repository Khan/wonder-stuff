import type {Application, Request, Response} from "express";
import {
    startServer as startServerCore,
    Runtime,
    createLogger,
} from "@khanacademy/wonder-stuff-server";
import type {RequestWithLog} from "@khanacademy/wonder-stuff-server";
import * as lw from "@google-cloud/logging-winston";
import {addAppEngineMiddleware} from "./add-app-engine-middleware";
import {setupIntegrations} from "./setup-integrations";

import type {ServerOptions} from "./types";
import {getDefaultLogMetadata} from "./get-default-log-metadata";

/**
 * Start a Google Cloud app engine server.
 *
 * This takes a server application definition and attaches Goole Cloud
 * middleware before listening on the appropriate port per the passed options.
 */
export async function startServer<
    TReq extends RequestWithLog<Request>,
    TRes extends Response,
>(
    options: ServerOptions,
    app: Application<TReq, TRes>,
): Promise<http.Server | null | undefined> {
    const {integrations, logLevel, ...restOptions} = options;

    /**
     * Make sure GAE_SERVICE has a value.
     *
     * If it isn't set at this point, we're not running in GAE, so we can
     * set it ourselves.
     */
    if (process.env.GAE_SERVICE == null) {
        process.env.GAE_SERVICE = restOptions.name;
    }

    // Setup the logger.
    const logger = createLogger({
        mode: restOptions.mode,
        level: logLevel,
        defaultMetadata: getDefaultLogMetadata(),
        transport:
            // In production, we use the Google Cloud logging winston transport.
            restOptions.mode === Runtime.Production
                ? new lw.LoggingWinston({
                      // @ts-expect-error [FEI-5011] - TS2322 - Type 'string | number | symbol' is not assignable to type 'string | undefined'.
                      level: logLevel,
                  })
                : null,
    });

    // Set up Google Cloud debugging integrations.
    await setupIntegrations(restOptions.mode, integrations);

    // Add GAE middleware to the app.
    const appWithMiddleware = await addAppEngineMiddleware<TReq, TRes>(
        app,
        restOptions.mode,
        logger,
    );

    // Start and return the server.
    return startServerCore(
        {
            ...restOptions,

            // Provide the logger we created.
            logger,

            // We override the request middleware in production.
            includeRequestMiddleware: restOptions.mode !== Runtime.Production,
        },
        appWithMiddleware,
    );
}
