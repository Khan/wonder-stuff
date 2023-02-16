// @flow
import type {Tracer} from "@google-cloud/trace-agent";
import {Errors, KindError} from "@khanacademy/wonder-stuff-core";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import {getAppEngineInfo} from "./get-app-engine-info";
import {getDelta} from "./get-delta";
import {getDefaultLogMetadata} from "./get-default-log-metadata";
import type {ITraceSession, TraceSessionInfo} from "./types";

/**
 * Start tracing an event.
 *
 * This will log the start of a trace and open a trace session, which is
 * returned. Use the returned session to end the trace when the traced event is
 * over. The traced event will be logged and also written to the Google Cloud
 * StackDriver Trace agent.
 *
 * Trace logs include metadata about the trace such as duration and memory
 * usage.
 *
 * @param {Logger} logger A logger to use for documention and timing the
 * traced action.
 * @param {string} action The name of the traced action. Keep it short. This
 * should be the name of an action rather than a specific URL, for example. Use
 * addLabel on the returned session or the session info when ending the session
 * to add additional details about the trace.
 * @param {string} message A message that will be logged. This is not included
 * in the traces.
 * @param {Tracer} [tracer] A Google Cloud trace agent tracer which
 * can be used to record the traced action.
 * @returns {ITraceSession} A trace session that the caller should use to
 * indicate when the session is finished.
 */
export const traceImpl = (
    logger: Logger,
    action: string,
    message: string,
    tracer?: Tracer,
): ITraceSession => {
    if (!action) {
        throw new KindError(
            "Must provide an action for the trace session.",
            Errors.InvalidInput,
        );
    }
    const logMessage = `${action}${message ? `: ${message}` : ""}`;

    /**
     * We are going to use the logger's profiling API (provided by winston).
     * However, we want to mark the start of the trace as it gives us some
     * debug information which can be valuable when investigating operations.
     *
     * Winston only logs when profiling is done and the optional trace agent
     * tracer will only show the span if it is ended.
     *
     * Since this is noise in most situations, we will log this at the lowest
     * level of silly.
     */
    logger.silly(`TRACE ${logMessage}`);

    /**
     * Now we start the profiling timer.
     */
    const profiler = logger.startTimer();
    const beforeMemory = process.memoryUsage();
    const {name: gatewayName} = getAppEngineInfo();

    /**
     * Next, if we were given a tracer, we start a trace section for this so
     * trace session so that it will appear in Stackdriver Trace.
     *
     * We annotate the span with the gateway name so that it is clear in the
     * trace which spans were created by this API and which were inserted by
     * other means.
     */
    const span = tracer?.createChildSpan({name: `${gatewayName}.${action}`});

    const profileLabels: {|
        [string]: mixed,
    |} = {};
    const addLabel = <T>(name: string, value: T): void => {
        /**
         * Track this so we can also include it in our logging info.
         */
        profileLabels[name] = value;

        /**
         * Send this label on to the trace span.
         *
         * We disable this lint rule as the linter does not appear to
         * understand the optional chaining.
         */
        span?.addLabel(name, value);
    };

    /**
     * This is the function that we will return to our caller.
     * It can then be used to end and record the trace session.
     */
    const end = (info?: TraceSessionInfo): void => {
        const afterMemory = process.memoryUsage();

        /**
         * Add some session information to the span as labels.
         *
         * Flow doesn't trust the inexact objects returned by memoryUsage()
         * and so `getDelta` isn't typed to handle that. Have to rethink
         * how to make that work.
         */
        // $FlowFixMe[incompatible-call]
        addLabel("/memory/delta", getDelta(beforeMemory, afterMemory));
        addLabel("/memory/final", afterMemory);

        /**
         * We need to build the metadata that we will be logging.
         * This is a combination of the given info, some custom things we add,
         * and any profile labels that were added.
         *
         * We suppress flow because we want the TraceSessionInfo to overwrite
         * things and it's OK if we don't know what things it overwrites.
         */
        // $FlowIgnore[cannot-spread-indexer]
        const metadata = {
            /**
             * We have to add the default metadata because winston does not
             * include this for profiler.done calls, strangely.
             */
            level: "debug",
            ...getDefaultLogMetadata(),
            ...profileLabels,
            ...info,
            message: `TRACED ${logMessage}`,
        };

        /**
         * Let's mark our profile as done.
         *
         * We include the session info object, but make sure to set the level
         * and message ourselves.
         */
        profiler.done(metadata);

        /**
         * If we started a tracer span, let's end it.
         *
         * We disable this lint rule as the linter does not appear to
         * understand the optional chaining.
         */
        span?.endSpan();
    };

    return {
        get action() {
            return action;
        },
        addLabel,
        end,
    };
};
