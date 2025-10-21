import type {
    Logger as WinstonLogger,
    LogEntry,
    transport as Transport,
} from "winston";
import {Runtime} from "@khanacademy/wonder-stuff-core";

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
 * Options to configure logging.
 */
export type LoggingOptions = {
    /**
     * The runtime mode.
     */
    mode: Runtime;
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
