import type {
    Logger as WinstonLogger,
    LogEntry,
    transport as Transport,
} from "winston";
import type {Request} from "express";
import type {SecretString} from "@khanacademy/wonder-stuff-core";

/**
 * Describes logging metdata.
 */
export type Info = LogEntry;

/**
 * Defines the different log levels.
 */
export type LogLevel = string;

/**
 * Describes the interface for logging gateway activity.
 */
export type Logger = WinstonLogger;

/**
 * The runtime modes that a gateway can run under.
 */
export enum Runtime {
    Production = "production",
    Development = "development",
    Test = "test",
}

export type RuntimeValue = (typeof Runtime)[keyof typeof Runtime];

/**
 * Options to configure logging.
 */
export type LoggingOptions = {
    /**
     * The runtime mode.
     */
    mode: RuntimeValue;
    /**
     * Log only if the level of a logged entry is less than or equal to this
     * level. Enables filtering out of debug message in production, for example.
     */
    level: LogLevel;
    /**
     * Metadata to attach to every logged entry, by default.
     * Defaults to null.
     */
    defaultMetadata?: Record<any, any> | (() => Record<any, any>);
    /**
     * The transport to use for handling log entries. When not specified or
     * null, this will be determined using `getLoggingTransport`.
     */
    transport?: Transport | null | undefined;
};

/**
 * Options to define request authentication.
 */
export type RequestAuthentication = {
    /**
     * The secret to use for authenticating a request.
     */
    readonly secret: SecretString;

    /**
     * The previous secret used for authenticating a request.
     */
    readonly deprecatedSecret?: SecretString;

    /**
     * The name of the header to use for authenticating a request.
     *
     * This is a header in the request, the value of which will be matched
     * against the secrets identified by `secret` and `deprecatedSecret`.
     */
    readonly headerName: string;
};

/**
 * Options to configure a server.
 */
export type ServerOptions = {
    /**
     * The name of the server.
     */
    readonly name: string;
    /**
     * The port on which the server should listen.
     */
    readonly port: number;
    /**
     * The hostname to which the server should bind.
     */
    readonly host: string;
    /**
     * What runtime mode the server is running under.
     */
    readonly mode: RuntimeValue;
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
    readonly keepAliveTimeout?: number;
    /**
     * When `true`, the "heapdump" package will be loaded, allowing for
     * heap dumps to be generated on demand using `kill -USR2 <pid>` where
     * `<pid>` is the process ID of the server.
     *
     * Defaults to `false` in production mode, and `true` in all other modes.
     * Set explicitly to `false` to disable heap dumps in all modes.
     */
    readonly allowHeapDumps?: boolean;
    /**
     * Configuration information for authenticating requests.
     */
    readonly requestAuthentication?: RequestAuthentication;
    /**
     * Configuration for various Google Cloud agents that can aid debugging.
     */
    readonly integrations?: GoogleCloudIntegrations;
    /**
     * The log level at which to log things. Anything at or more serious than
     * this level will be logged.
     */
    readonly logLevel: LogLevel;
};

export type RequestWithLog<TReq extends Request> = TReq & {
    log?: Logger;
};

/**
 * Configure Google Cloud server integrations.
 */
export type GoogleCloudIntegrations = {
    /**
     * Enable the profiler.
     * Defaults to false.
     */
    readonly profiler?: boolean;
};

/**
 * Information about an App Engine service instance.
 */
export type AppEngineInfo = {
    /**
     * Usually the value of GAE_SERVICE, if set. Otherwise, "unknown".
     */
    readonly name: string;
    /**
     * Usually the value of GAE_VERSION, if set. Otherwise, "unknown".
     */
    readonly version: string;
    /**
     * Usually the value of GAE_INSTANCE, if set. Otherwise, "unknown".
     */
    readonly instance: string;
    /**
     * The process identifier.
     */
    readonly pid: number;
};

/**
 * Information to attach to a trace session.
 */
export type TraceSessionInfo = {
    /**
     * The level at which to log the session.
     */
    readonly level?: LogLevel;
    /**
     * Additional metadata about the session. Unlike using `addLabel` on the
     * trace session, this will only go to logging and not the trace as well.
     */
    readonly [datum: string]: unknown;
};

/**
 * A trace session that has been started.
 */
export interface ITraceSession {
    /**
     * The name of the action being traced as provided when it was started.
     */
    get action(): string;
    /**
     * Add a label to the trace session.
     *
     * Adds a key-value pair as a label to the trace span and metadata to the
     * logged output. Both the name and value may be truncated in the trace
     * according to hosting configuration. The value will be coerced to a
     * string in tracing if it isn't one already.
     */
    addLabel<T>(name: string, value: T): void;
    /**
     * End the trace session.
     *
     * It the session were opened with a Google Cloud tracer, this will also
     * end the associated tracer span.
     *
     * @param {TraceSessionInfo} [info] Additional information to
     * modify the logged session info. This can be used to provide a different
     * level at which to log the session (default is "debug"). All other
     * fields are used to add metadata to the logged session.
     * @returns {void}
     */
    end(info?: TraceSessionInfo): void;
}
