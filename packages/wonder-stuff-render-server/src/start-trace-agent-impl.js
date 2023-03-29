// @flow
// Start logging agent for Cloud Trace (https://cloud.google.com/trace/).
import * as traceAgent from "@google-cloud/trace-agent";
import type {Tracer} from "@google-cloud/trace-agent";
import {getRuntimeMode} from "@khanacademy/wonder-stuff-server";

/**
 * Starts the Google Cloud Trace agent.
 *
 * This should be imported and executed before any other imports.
 */
export const startTraceAgent = (): Tracer =>
    traceAgent.start({enabled: getRuntimeMode() === "production"});
