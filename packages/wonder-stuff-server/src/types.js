// @flow
import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
    Transport,
} from "winston";

import type {$Request, Middleware, $Response} from "express";

/**
 * Describes logging metdata.
 */
export type Info = WinstonInfo<NpmLogLevels>;

/**
 * Defines the different log levels.
 */
export type LogLevel = $Keys<NpmLogLevels>;

/**
 * Describes the interface for logging gateway activity.
 */
export type Logger = WinstonLogger<NpmLogLevels>;

/**
 * The runtime modes that a gateway can run under.
 */
export enum Runtime {
    // TODO(somewhatabstract, FEI-4172): Update eslint-plugin-flowtype when
    // they've fixed https://github.com/gajus/eslint-plugin-flowtype/issues/502
    /* eslint-disable no-undef */
    Production = "production",
    Development = "development",
    Test = "test",
    /* eslint-enable no-undef */
}

/**
 * Options to configure logging.
 */
export type LoggingOptions = {
    /**
     * The runtime mode to be targeted. When omitted, this will default to
     * the current runtime mode as determined from `getRuntimeMode`.
     */
    mode?: Runtime,

    /**
     * Log only if the level of a logged entry is less than or equal to this
     * level. Enables filtering out of debug message in production, for example.
     */
    level: LogLevel,

    /**
     * Metadata to attach to every logged entry, by default.
     * Defaults to null.
     */
    defaultMetadata?: {...} | (() => {...}),

    /**
     * The transport to use for handling log entries. When not specified,
     * this will be determined using `getLoggingTransport`.
     */
    transport?: Transport,
};

/**
 * Options to configure log middleware.
 */
export type LogMiddlewareOptions<TReq: $Request, TRes: $Response> = {
    /**
     * The runtime mode to be targeted. When omitted, this will default to
     * the current runtime mode as determined from `getRuntimeMode`.
     */
    mode?: Runtime,

    /**
     * The logger that the middleware should target.
     */
    logger: Logger,

    /**
     * Override the default request logging middleware.
     * Defaults to express-winston's logger.
     */
    makeRequestMiddleware?: (
        mode: Runtime,
        logger: Logger,
    ) => Promise<Middleware<TReq, TRes>>,

    /**
     * Override the default error logging middleware.
     * Defaults to express-winston's errorLogger
     */
    makeErrorMiddleware?: (
        mode: Runtime,
        logger: Logger,
    ) => Promise<Middleware<TReq, TRes>>,
};

/**
 * Options to configure a server.
 */
export type ServerOptions = {
    /**
     * The name of the server.
     */
    +name: string,

    /**
     * The port on which the server should listen.
     */
    +port: number,

    /**
     * The hostname to which the server should bind.
     */
    +host: string,

    /**
     * The logger to use for logging.
     */
    +logger: Logger,

    /**
     * What runtime mode the server is running under.
     */
    +mode: Runtime,

    /**
     * Optional value in milliseconds for keepalive timeout of the server.
     * For running in Google Cloud, this should be higher than the load
     * balancer's own keepalive timeout value, which at time of writing was
     * indicated to be 80000ms [1].
     *
     * [1] https://khanacademy.slack.com/archives/CJSE4TMQX/p1573252787333500
     *
     * Defaults to 90000.
     */
    +keepAliveTimeout?: number,

    /**
     * When `true`, the "heapdump" package will be loaded, allowing for
     * heap dumps to be generated on demand using `kill -USR2 <pid>` where
     * `<pid>` is the process ID of the server.
     *
     * Defaults to `false` in production mode, and `true` in all other modes.
     * Set explicitly to `false` to disable heap dumps in all modes.
     */
    +allowHeapDumps?: boolean,

    /**
     * When `true` or omitted, the default express-winston-based error logging
     * middleware is included. When `false`, this is not included.
     */
    +includeErrorMiddleware?: boolean,

    /**
     * When `true` or omitted, the default express-winston-based request logging
     * middleware is included. When `false`, this is not included.
     */
    +includeRequestMiddleware?: boolean,
};

export type RequestWithLog<TReq: $Request> = TReq & {
    log?: Logger,
};
