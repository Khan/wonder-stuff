// @flow
import type {$Application, $Request, $Response} from "express";
import {useAppEngineMiddleware} from "./use-app-engine-middleware.js";
import {setupStackdriver} from "./setup-stackdriver.js";
import {setRootLogger} from "./root-logger.js";
import type {GatewayOptions, RequestWithLog} from "./types.js";
import {Errors} from "./errors.js";

/**
 * Start a gateway application server.
 *
 * This takes a server application definition and attaches middleware before
 * listening on the appropriate port per the passed options.
 */
export async function startGateway<
    TReq: RequestWithLog<$Request>,
    TRes: $Response,
>(
    options: GatewayOptions,
    app: $Application<TReq, TRes>,
): Promise<?http$Server> {
    const {logger, host, port, name, mode, keepAliveTimeout} = options;

    /**
     * Make sure GAE_SERVICE has a value.
     *
     * If it isn't set at this point, we're not running in GAE, so we can
     * set it ourselves.
     */
    if (process.env.GAE_SERVICE == null) {
        process.env.GAE_SERVICE = name;
    }

    /**
     * Setup logging.
     * We create the root logger once and then share it via a singleton.
     * This avoids us creating a new one in each worker, which was happening
     * when we created the logger on import of `getLogger`.
     */
    setRootLogger(logger);

    /**
     * In development mode, we include the heapdump module if it exists.
     * With this installed, `kill -USR2 <pid>` can be used to create a
     * heapsnapshot file of the gateway's memory.
     *
     * We ignore this from coverage because we don't care enough to test it.
     */
    /* istanbul ignore next */
    if (process.env.KA_ALLOW_HEAPDUMP || mode === "development") {
        try {
            /* eslint-disable import/no-unassigned-import */
            // $FlowIgnore[cannot-resolve-module]
            require("heapdump");
            /* eslint-enable import/no-unassigned-import */
            logger.debug(
                `Heapdumps enabled. To create a heap snapshot at any time, run "kill -USR2 ${process.pid}".`,
            );
        } catch (e) {
            // heapdump is an optional peer dependency, so if it is absent,
            // that is perfectly fine.
        }
    }

    // Set up stackdriver integrations.
    await setupStackdriver(mode, options.cloudOptions);

    // Add GAE middleware.
    const appWithMiddleware = await useAppEngineMiddleware<TReq, TRes>(
        app,
        mode,
        logger,
    );

    /**
     * Start the gateway listening.
     *
     * We need the variable so we can reference it inside the error handling
     * callback. Feels a bit nasty, but it works.
     */
    const gateway = appWithMiddleware.listen(port, host, (err: ?Error) => {
        if (gateway == null || err != null) {
            logger.error(
                `${name} appears not to have started: ${
                    (err && err.message) || "Unknown error"
                }`,
                {
                    kind: Errors.Internal,
                },
            );
            return;
        }

        const address = gateway.address();
        if (address == null || typeof address === "string") {
            logger.warn(`${name} may not have started properly: ${address}`);
            return;
        }

        const host = address.address;
        const port = address.port;
        logger.info(`${name} running at http://${host}:${port}`);
    });

    /**
     * We use keep-alive connections with other resources. These can prevent
     * the gateway process from shutting down if they are open when we're
     * trying to close. So, let's track them and provide a means for us to\
     * destroy them.
     */
    const connections = {};
    const closeConnections = () => {
        for (const connection of Object.values(connections)) {
            (connection: any).destroy();
        }
    };
    gateway?.on("connection", (connection) => {
        const key = `${connection.remoteAddress}:${connection.remotePort}`;
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
        if (!gateway) {
            return;
        }

        logger.info("SIGINT received, shutting down server.");

        try {
            gateway.close((err) => {
                if (err) {
                    logger.error(
                        `Error shutting down server: ${
                            (err && err.message) || "Unknown Error"
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
        } catch (err) {
            logger.error(
                `Error closing gateway: ${
                    (err && err.message) || "Unknown Error"
                }`,
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
    if (gateway != null) {
        gateway.keepAliveTimeout = keepAliveTimeout || 90000;

        /**
         * The Flow type for a Node server does not include headersTimeout.
         * However, if we don't do the following shenanigans, it puts an error
         * on the appWithMiddleware.listen call above instead of here, and that
         * just feels wrong. I tried a $FlowIgnore here, but that doesn't work,
         * it has to be suppressed above in that case.
         */
        const trickFlow: any = gateway;
        trickFlow.headersTimeout = gateway.keepAliveTimeout + 5000;
    }

    return gateway;
}
