import {
    createLogger,
    Runtime,
    setRootLogger,
} from "@khanacademy/wonder-stuff-server";

import * as winston from "winston";

import {getGCPLogTransport} from "./get-gcp-log-transport";

let logger: winston.Logger | null = null;

/**
 * Logger for auditing mobile release events.
 * @param {boolean} redirectToStdout If true, logs will be written to stdout.
 * @param {[key: string]: string} labels K/V metadata that will be add to the logs
 */
export const getMobileReleaseLogger = (
    {
        redirectToStdout = false,
        labels = {},
    }: {
        redirectToStdout: boolean;
        labels: {[key: string]: string};
    } = {
        redirectToStdout: false,
        labels: {},
    },
): winston.Logger => {
    if (!logger) {
        logger = createLogger({
            mode: Runtime.Production,
            level: "info",
            defaultMetadata: {},
            transport: getGCPLogTransport({
                // Hardcoded so that the client does not need to know these values
                projectId: "mobile-365917",
                logName: "release-raccoon",
                level: "info",
                redirectToStdout: redirectToStdout,
                labels: {},
            }),
        });
        setRootLogger(logger);
    }
    return logger;
};
