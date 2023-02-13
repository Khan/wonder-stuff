// @flow
import type {
    NpmLogLevels,
    Logger as WinstonLogger,
    Info as WinstonInfo,
    Transport,
} from "winston";

import type {$Request} from "express";

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
// TODO(FEI-5001): Replace with TS enum
export const Runtime = {
    Production: ("production": "production"),
    Development: ("development": "development"),
    Test: ("test": "test"),
};

/**
 * Options to configure logging.
 */
export type LoggingOptions = {
    /**
     * The runtime mode.
     */
    mode: $Values<typeof Runtime>,

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
     * The transport to use for handling log entries. When not specified or
     * null, this will be determined using `getLoggingTransport`.
     */
    transport?: ?Transport,
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
    +mode: $Values<typeof Runtime>,

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
