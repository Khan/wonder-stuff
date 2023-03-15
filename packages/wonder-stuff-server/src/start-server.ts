import * as http from "http";
import * as net from "net";
import type {Application} from "express";
import * as lw from "@google-cloud/logging-winston";
import {setRootLogger} from "./root-logger";
import {createLogger} from "./create-logger";
import {Runtime} from "./types";
import type {ServerOptions} from "./types";
import {Errors} from "./errors";
import {wrapWithMiddleware} from "./middleware/wrap-with-middleware";
import {getDefaultLogMetadata} from "./get-default-log-metadata";
import {setupGoogleCloudIntegrations} from "./setup-google-cloud-integrations";

/**
 * Start an application server.
 *
 * This takes a server application definition and sets up logging middleware
 * and other pieces before listening on the appropriate port per the passed
 * options.
 */
export async function startServer(
    {
        host,
        port,
        name,
        mode,
        keepAliveTimeout,
        allowHeapDumps,
        requestAuthentication,
        integrations,
        logLevel,
    }: ServerOptions,
    app: Application,
): Promise<http.Server | null | undefined> {
    /**
     * Make sure GAE_SERVICE has a value.
     *
     * If it isn't set at this point, we're not running in GAE, so we can
     * set it ourselves.
     */
    if (process.env.GAE_SERVICE == null) {
        process.env.GAE_SERVICE = name;
    }

    // Setup the logger.
    // We create the root logger once and then share it via a singleton.
    // This avoids us creating a new one in each worker, which was happening
    // when we created the logger on import of `getLogger`.
    const logger = createLogger({
        mode,
        level: logLevel,
        defaultMetadata: getDefaultLogMetadata(),
        transport:
            // In production, we use the Google Cloud logging winston transport.
            mode === Runtime.Production
                ? new lw.LoggingWinston({
                      level: logLevel,
                  })
                : null,
    });
    setRootLogger(logger);

    /**
     * In development mode, we include the heapdump module if it exists.
     * With this installed, `kill -USR2 <pid>` can be used to create a
     * heapsnapshot file of the gateway's memory.
     *
     * We ignore this from coverage because we don't care enough to test it.
     */
    /* istanbul ignore next */
    if (
        allowHeapDumps === true ||
        (mode !== Runtime.Production && allowHeapDumps !== false)
    ) {
        try {
            /* eslint-disable import/no-unassigned-import */
            require("heapdump");
            /* eslint-enable import/no-unassigned-import */
            logger.debug(
                `Heapdumps enabled. To create a heap snapshot at any time, run "kill -USR2 ${process.pid}".`,
            );
        } catch (e: any) {
            // heapdump is an optional peer dependency, so if it is absent,
            // that is perfectly fine.
        }
    }

    // Set up Google Cloud debugging integrations.
    await setupGoogleCloudIntegrations(mode, integrations);

    // Wrap the server app with our middleware.
    const appWithMiddleware = await wrapWithMiddleware(
        app,
        logger,
        mode,
        requestAuthentication,
    );

    /**
     * Start the server listening.
     *
     * We need the variable so we can reference it inside the error handling
     * callback. Feels a bit nasty, but it works.
     */
    const server: http.Server = appWithMiddleware.listen(
        port,
        host,
        (err?: Error | null) => {
            if (server == null || err != null) {
                logger.error(
                    `${name} appears not to have started: ${
                        err?.message || "Unknown error"
                    }`,
                    {
                        kind: Errors.Internal,
                    },
                );
                return;
            }

            const address = server.address();
            if (address == null || typeof address === "string") {
                logger.warn(
                    `${name} may not have started properly: ${address}`,
                );
                return;
            }

            const host = address.address;
            const port = address.port;
            logger.info(`${name} running at http://${host}:${port}`);
        },
    );

    /**
     * We use keep-alive connections with other resources. These can prevent
     * the gateway process from shutting down if they are open when we're
     * trying to close. So, let's track them and provide a means for us to\
     * destroy them.
     */
    const connections: {
        [key: string]: net.Socket;
    } = {};
    const closeConnections = () => {
        for (const connection of Object.values(connections)) {
            connection.destroy();
        }
    };
    server?.on("connection", (connection: net.Socket) => {
        const key = `${connection.remoteAddress ?? ""}:${
            connection.remotePort
        }`;
        connections[key] = connection;
        connection.on("close", () => {
            delete connections[key];
        });
    });

    /**
     * When this server is being run (by direct invocation, or using a process
     * manager, such as PM2), we may be asked to shutdown gracefully.
     * We do this be listening for the SIGINT signal and then close the server.
     * This prevents new connections from coming in and waits until the
     * existing connections complete before the callback is fired.
     * At which point we can safely shutdown the server.
     *
     * We hurry things along by actively closing any existing connections
     * once the close has been requested.
     *
     * If we fail to respond then the process manager may try to forcefully
     * shutdown the server after a timeout.
     */
    process.on("SIGINT", () => {
        if (!server) {
            return;
        }

        logger.info("SIGINT received, shutting down server.");

        try {
            server.close((err) => {
                if (err) {
                    logger.error(
                        `Error shutting down server: ${
                            err.message || "Unknown Error"
                        }`,
                        {
                            kind: Errors.Internal,
                        },
                    );
                    process.exit(1);
                } else {
                    process.exit(0);
                }
            });
            closeConnections();
        } catch (err: any) {
            logger.error(
                `Error closing server: ${err?.message || "Unknown Error"}`,
                {
                    kind: Errors.Internal,
                },
            );
            process.exit(1);
        }
    });

    /**
     * NOTE(somewhatabstract): We have seen many 502 BAD GATEWAY errors in
     * production Node services. It seems this is because the Node server
     * is closing a connection before the load balancer is expecting it to.
     * There is some indication on the Internet [1] that the issue can occur
     * when Node's (or nginx [2]) keepalive is lower than the load balancer's
     * keepalive. In addition, the recommended fix is to always have the load
     * balancer close a connection by ensuring the Node server has a higher
     * keepalive timeout value than the load balancer.
     *
     * Node's default is 5s, but the indication is that the Google load
     * balancer value is 80s [3]. So, here we default to 90s, but we also
     * provide a configuration value to change it as needed.
     *
     * In addition, it is suggested that the headers timeout should be higher
     * than the keepalive timeout [1].
     *
     * [1] https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
     * [2] https://blog.percy.io/tuning-nginx-behind-google-cloud-platform-http-s-load-balancer-305982ddb340
     * [3] https://khanacademy.slack.com/archives/CJSE4TMQX/p1573252787333500
     */
    if (server != null) {
        server.keepAliveTimeout = keepAliveTimeout ?? 90000;
        server.headersTimeout = server.keepAliveTimeout + 5000;
    }

    return server;
}
