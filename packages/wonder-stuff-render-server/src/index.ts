/**
 * Trace agent is a special case where it must be imported first to ensure
 * correct instrumentation of other imported modules.
 */
// eslint-disable-next-line import/no-unassigned-import
import "./start-trace-agent";

export * as Requests from "./request";

export type {
    RenderGatewayOptions,
    RequestOptions,
    AbortablePromise,
    IRenderEnvironment,
    TraceCallback,
    RenderAPI,
    RenderResult,
    ErrorResult,
    CustomErrorHandlerFn,
    Response,
    Request,
    Timeouts,
    ICloseable,
    SimplifiedError,
    AmbiguousError,
} from "./types";

export {extractError} from "./extract-error";
export {runServer} from "./run-server";
