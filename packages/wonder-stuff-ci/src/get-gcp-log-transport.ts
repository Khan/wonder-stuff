import * as winston from "winston";
import * as lw from "@google-cloud/logging-winston";

/**
 * Winston logging transport for emitting logs to GCP
 * @param {string} projectId The GCP project ID to send logs to.
 * @param {string} logName The name of the log to send logs to in GCP.
 * @param {boolean} redirectToStdout If true, logs will be written to stdout.
 * @param {string} level The log level to send to GCP.
 * @param {[key: string]: string} labels K/V metadata that will be add to the logs
 * @returns {winston.transport} logger set up to send logs to GCP.
 */
export const getGCPLogTransport = ({
    projectId,
    logName,
    redirectToStdout,
    level,
    labels,
}: {
    projectId: string;
    logName: string;
    redirectToStdout: boolean;
    level: string;
    labels: {[key: string]: string};
}): winston.transport => {
    const transport = new lw.LoggingWinston({
        projectId: projectId,
        logName: logName,
        level: level,
        resource: {
            labels: labels,
        },
        defaultCallback: (err) => {
            if (err) {
                console.log("Error occurred while sending log to GCP: " + err);
            }
        },
        redirectToStdout: redirectToStdout,
    });

    return transport;
};
