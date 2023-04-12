import * as winston from "winston";
import * as gcpLogger from "@google-cloud/logging-winston";
const {combine, timestamp, json, errors, printf, colorize} = winston.format;

/**
 * Winston logger used for generating to GCP for the mobile release process (release-raccoon).
 * @param {string} projectId The GCP project ID to send logs to.
 * @param {string} logName The name of the log to send logs to in GCP.
 * @param {string} logLevel The minimum severity level to log.
 * @param {boolean} enableConsoleLogs If true, logs will be sent to the console as well as GCP.
 * @param {[key: string]: string} labels K/V metadata that will be add to the logs
 * @returns {winston.Logger} logger set up to send logs to GCP.
 */
export const getMobileReleaseLogger = (
    args = {
        projectId: "mobile-365917",
        logName: "release-raccoon",
        logLevel: "info",
        enableConsoleLogs: false,
        labels: {},
    },
): winston.Logger => {
    // Set up logging configuration to GCP
    const loggingGCPWinston = new gcpLogger.LoggingWinston({
        projectId: args.projectId,
        logName: args.logName,
        resource: {
            labels: args.labels,
        },
        defaultCallback: (err) => {
            if (err) {
                console.log("Error occurred while sending log to GCP: " + err);
            }
        },
    });

    // Create the logger object to be used by the client
    const logger = winston.createLogger({
        level: args.logLevel, // Severity
        format: combine(timestamp(), json(), errors({stack: true})),
        transports: [
            // Add Cloud Logging
            loggingGCPWinston,
        ],
        // Uncaught exceptions will go to the console and GCP
        exceptionHandlers: [
            new winston.transports.Console(),
            loggingGCPWinston,
        ],
        rejectionHandlers: [
            new winston.transports.Console(),
            loggingGCPWinston,
        ],
    });

    let alignColorsAndTime = winston.format.combine(
        winston.format.timestamp({
            format: "YY-MM-DD HH:mm:ss",
        }),
        winston.format.printf(
            (info) => `[${info.timestamp}] [${info.level}] : ${info.message}`,
        ),
        errors({stack: true}),
    );

    if (args.enableConsoleLogs) {
        logger.add(
            new winston.transports.Console({
                format: combine(
                    winston.format.colorize({
                        all: true,
                    }),
                    alignColorsAndTime,
                ),
            }),
        );
    }
    return logger;
};
