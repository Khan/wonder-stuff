import express from "express";
import type {Application} from "express";
import * as lw from "@google-cloud/logging-winston";
import type {Logger, RequestAuthentication, RuntimeValue} from "../types";
import {Runtime} from "../types";
import {attachAppEngineRequestID} from "./attach-app-engine-request-id";
import {commonServiceRoutes} from "./common-service-routes";
import {defaultErrorLogging} from "./default-error-logging";
import {defaultRequestLogging} from "./default-request-logging";
import {logRequestInfo} from "./log-request-info";
import {requestAuthentication} from "./request-authentication";

export const wrapWithMiddleware = async (
    app: Application,
    logger: Logger,
    mode: RuntimeValue,
    requestAuthOptions: RequestAuthentication,
): Promise<Application> => {
    // Setup the middleware around the app.
    const appWithMiddleware = express()
        // Ensure the requestID is added to the logging metadata.
        .use(attachAppEngineRequestID(logger));

    // Now add request logging.
    if (mode === Runtime.Production) {
        // If we're in production, we use the logging-winston middleware from
        // Google Cloud.
        appWithMiddleware.use(await lw.express.makeMiddleware(logger));
    } else {
        // If we're not in production, we use some default request logging
        //
        appWithMiddleware.use(defaultRequestLogging(logger));
    }

    // Next, we need to add some APIs that our deploy system and other
    // things need, followed by the request authentication middleware and
    // then the app itself.
    appWithMiddleware
        // Some API routes that are used by deployment systems and Google Cloud.
        .use(commonServiceRoutes())
        // The request authentication check that ensures requests are from
        // a trusted source.
        .use(requestAuthentication(requestAuthOptions))
        // After the secret check, we log info about the request. Since this
        // is logging, it MUST go after the secret check or we might leak a
        // secret, and we don't want that.
        .use(logRequestInfo)
        // Now the server app that is being run.
        .use(app)
        // Finally, our error logging handling at the end.
        .use(defaultErrorLogging(logger));

    return appWithMiddleware;
};
