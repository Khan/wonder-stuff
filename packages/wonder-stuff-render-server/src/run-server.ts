import {startServer, getRuntimeMode} from "@khanacademy/wonder-stuff-server";
import express from "express";
import asyncHandler from "express-async-handler";
import type {RenderGatewayOptions} from "./types";
import {getLogLevel} from "./get-log-level";
import {makeRenderHandler} from "./handlers/make-render-handler";
import {getRequestAuthentication} from "./get-request-authentication";

/**
 * Run the render-gateway server using the provided options.
 *
 * @param {RenderGatewayOptions} options The options that define how the
 * render gateway will operate.
 * @returns {Promise<void>} The promise of working.
 */
export const runServer = async (
    options: RenderGatewayOptions,
): Promise<void> => {
    const {
        authentication,
        renderEnvironment,
        uncaughtRenderErrorHandler,
        defaultRenderErrorResponse,
        host,
        port,
        cloudOptions,
        keepAliveTimeout,
        name,
    } = options;

    if (process.env.NODE_ENV !== getRuntimeMode()) {
        process.env.NODE_ENV =
            process.env.KA_IS_DEV_SERVER === "1" ? "development" : "production";
    }

    const app = express().get(
        "/_render",
        asyncHandler(
            makeRenderHandler(
                renderEnvironment,
                uncaughtRenderErrorHandler,
                defaultRenderErrorResponse,
            ),
        ),
    );

    /**
     * Added this to support forwarding proxies in case we need it, per the
     * documentation:
     *
     * https://cloud.google.com/appengine/docs/standard/nodejs/runtime#https_and_forwarding_proxies
     */
    app.set("trust proxy", true);

    // Start the gateway.
    await startServer(
        {
            mode: getRuntimeMode(),
            logLevel: getLogLevel(),
            host,
            port,
            keepAliveTimeout,
            name,
            integrations: {
                profiler: cloudOptions?.profiler,
            },
            requestAuthentication:
                await getRequestAuthentication(authentication),
        },
        app,
    );
};
