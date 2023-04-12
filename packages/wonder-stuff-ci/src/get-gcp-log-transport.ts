import * as winston from "winston";
import * as lw from "@google-cloud/logging-winston";

/**
 * Winston logging transport for emitting logs to GCP
 * @param {GCPTransportOptions} options for the transport
 * @returns {winston.transport} logger set up to send logs to GCP.
 */
export const getGCPLogTransport = (
    options: GCPTransportOptions,
): winston.transport => {
    const transport = new lw.LoggingWinston({
        projectId: options.projectId,
        logName: options.logName,
        level: options.level,
        resource: {
            labels: options.labels,
        },
        defaultCallback: (err) => {
            if (err) {
                console.log("Error occurred while sending log to GCP: " + err);
            }
        },
        redirectToStdout: options.redirectToStdout,
    });

    return transport;
};
