/**
 * The information about a release branch.
 */
type MobileReleaseBranchInfo = {
    prefix: string;
    version: string;
};

/**
 * The options for the Winston GCP transport.
 */
type GCPTransportOptions = {
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
     * K/V metadata that will be add to the logs
     */
    labels: {[key: string]: string};
};
