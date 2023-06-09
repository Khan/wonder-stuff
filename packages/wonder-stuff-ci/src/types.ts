/**
 * The information about a release branch.
 */
export type MobileReleaseBranchInfo = {
    prefix: string;
    version: string;
};

/**
 * The options for the Winston GCP transport.
 */
export type GCPTransportOptions = {
    /**
     * The GCP project ID to send logs to.
     */
    projectId: string;
    /**
     * The name of the log to send logs to in GCP.
     */
    logName: string;
    /**
     * If true, logs will be written to stdout instead of GCP
     */
    redirectToStdout: boolean;
    /**
     * The log level to send to GCP.
     */
    level: string;
    /**
     * K/V labels that will be add to the logs
     */
    labels: {[key: string]: string};
    /**
     * K/V for setting the resource values for GCP
     */
    resource: {[key: string]: string};
};

/**
 * The gcp log levels that are supported.
 */
export type GCPLogLevels = "debug" | "info" | "warn" | "error";

/**
 * The options for the mobile release logger.
 */
export type MobileReleaseLoggerOptions = {
    /**
     * If true, logs will be written to stdout.
     */
    redirectToStdout?: boolean;
    /**
     * K/V labels that will be add to the logs
     */
    labels?: {[key: string]: string};
    /**
     * The minimum log level to send to GCP.
     */
    logLevel?: GCPLogLevels;
    /**
     * The name of the log to send logs to in GCP.
     */
    logName?: string;
    /**
     * The GCP project ID to send logs to.
     */
    projectId?: string;
    /**
     * K/V metadata that will be add to each the log
     */
    defaultMetadata?: {[key: string]: string};
    /**
     * K/V for setting the resource values for GCP, where resource.type is required by GCP API.
     */
    resource?: {[key: string]: string};
};
