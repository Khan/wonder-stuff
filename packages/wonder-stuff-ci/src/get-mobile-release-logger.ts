import {
    createLogger,
    Runtime,
    setRootLogger,
} from "@khanacademy/wonder-stuff-server";

import * as winston from "winston";

import {getGCPLogTransport} from "./get-gcp-log-transport";
import {GCPLogLevels} from "./types";

let logger: winston.Logger | null = null;

/**
 * Logger for auditing mobile release events.
 * @param {boolean} redirectToStdout If true, logs will be written to stdout.
 * @param {{[key: string]: string}} labels K/V metadata that will be add to the logs
 * @param {GCPLogLevels} logLevel The log level to send to GCP.
 * @param {string} logName The name of the log to send logs to in GCP.
 * @param {string} projectId The GCP project ID to send logs to.
 */
export const getMobileReleaseLogger = (
    {
        redirectToStdout,
        labels,
        logLevel,
        logName,
        projectId,
    }: {
        redirectToStdout: boolean;
        labels: {[key: string]: string};
        logLevel: GCPLogLevels;
        logName: string;
        projectId: string;
    } = {
        redirectToStdout: false,
        labels: {},
        logLevel: "info",
        logName: "release-raccoon",
        projectId: "mobile-365917",
    },
): winston.Logger => {
    if (!logger) {
        logger = createLogger({
            mode: Runtime.Production,
            level: logLevel,
            defaultMetadata: {},
            transport: getGCPLogTransport({
                projectId: projectId,
                logName: logName,
                level: logLevel,
                redirectToStdout: redirectToStdout,
                labels: labels,
            }),
        });
        setRootLogger(logger);
    }
    return logger;
};
