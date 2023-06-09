import {
    createLogger,
    Runtime,
    setRootLogger,
} from "@khanacademy/wonder-stuff-server";

import * as winston from "winston";

import {getGCPLogTransport} from "./get-gcp-log-transport";
import {MobileReleaseLoggerOptions} from "./types";

let logger: winston.Logger | null = null;

/**
 * Logger for auditing mobile release events with default values.
 */
export const getMobileReleaseLogger = ({
    redirectToStdout = false,
    labels = {},
    logLevel = "info",
    logName = "release-raccoon",
    projectId = "mobile-365917",
    defaultMetadata = {},
    resource = {
        type: "global",
    },
}: MobileReleaseLoggerOptions): winston.Logger => {
    if (!logger) {
        logger = createLogger({
            mode: Runtime.Production,
            level: logLevel,
            defaultMetadata: defaultMetadata,
            transport: getGCPLogTransport({
                projectId: projectId,
                logName: logName,
                level: logLevel,
                redirectToStdout: redirectToStdout,
                labels: labels,
                resource: resource,
            }),
        });
        setRootLogger(logger);
    }
    return logger;
};
