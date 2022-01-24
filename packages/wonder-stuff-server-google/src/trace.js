// @flow
import * as traceAgent from "@google-cloud/trace-agent";
import type {$Request} from "express";
import {getLogger} from "./get-logger.js";
import {traceImpl} from "./trace-impl.js";
import {safeHasOwnProperty} from "./safe-has-own-property.js";

import type {Logger, RequestWithLog, ITraceSession} from "./types.js";

interface ITrace {
    /**
     * Start tracing an event.
     *
     * This will log the start of a trace and open a trace session, which is
     * returned. Use the returned session to end the trace when the traced event is
     * over. The traced event will be logged and also written to the Google Cloud
     * StackDriver Trace agent.
     *
     * Note that if startTraceAgent was never called, this will still log but the
     * StackDriver trace span creation will not actually happen.
     *
     * @param {string} action The name of the action being traced.
     * @param {string} message A message to be logged along side the action
     * @param {TReq: RequestWithLog<$Request>} [request] The request being
     * fulfilled. This is used to determine if a request-scoped logger can be used.
     * @returns {ITraceSession} The new trace session that was created and is to be
     * used to end the session.
     */
    <TReq: RequestWithLog<$Request>>(
        action: string,
        message: string,
        request?: TReq,
    ): ITraceSession;

    /**
     * Start tracing an event.
     *
     * This will log the start of a trace and open a trace session, which is
     * returned. Use the returned session to end the trace when the traced event is
     * over. The traced event will be logged and also written to the Google Cloud
     * StackDriver Trace agent.
     *
     * Note that if startTraceAgent was never called, this will still log but the
     * StackDriver trace span creation will not actually happen.
     *
     * @param {string} action The name of the action being traced.
     * @param {string} message A message to be logged along side the action
     * @param {Logger} logger The logger to be used for the trace.
     * @returns {ITraceSession} The new trace session that was created and is to be
     * used to end the session.
     */
    (action: string, message: string, logger: Logger): ITraceSession;
}

export const trace: ITrace = (
    action: string,
    message: string,
    requestOrLogger: any,
): ITraceSession => {
    const tracer = traceAgent.get();
    if (requestOrLogger == null || safeHasOwnProperty(requestOrLogger, "url")) {
        const logger = getLogger(requestOrLogger);
        return traceImpl(logger, action, message, tracer);
    }
    return traceImpl(requestOrLogger, action, message, tracer);
};
