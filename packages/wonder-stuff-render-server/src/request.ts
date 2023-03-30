import type {Response} from "superagent";
import {trace} from "@khanacademy/wonder-stuff-server";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import type {
    RequestOptions,
    AbortablePromise,
    SuperAgentCallbackHandler,
} from "./types";
import {makeRequest} from "./make-request";
import {getResponseSource} from "./requests-from-cache";
import {extractError} from "./extract-error";

/**
 * The defaults used for request options.
 */
export const DefaultRequestOptions: RequestOptions = {
    retries: 2,
    timeout: 60000,
};

/**
 * Request a URL.
 *
 * NOTE: The AbortablePromise is only shallowly abortable. If any standard
 * promise methods are called on this, the promise they return no longer will
 * have the abort function. Therefore, you'll need to readd it.
 */
export const request = (
    logger: Logger,
    url: string,
    options?: RequestOptions,
): AbortablePromise<Response> => {
    let retryCount = 0;
    const retryTracker: SuperAgentCallbackHandler = (err, res) => {
        if (err != null) {
            // Only update the count on errors.
            // This gets called even for successful requests.
            retryCount++;
        }
        return options?.shouldRetry?.(err, res);
    };
    const optionsToUse = {
        ...DefaultRequestOptions,
        ...options,
        shouldRetry: retryTracker,
    } as const;
    const requestLogger = logger.child({url});

    /**
     * We don't already have this request in flight, so let's make a new
     * request.
     *
     * First, we start a trace.
     * Then we make the request.
     * Then we capture the abort function so we can reattach it later.
     */
    const traceSession = trace(`request`, url, requestLogger);
    traceSession.addLabel("url", url);
    const abortableRequest = makeRequest(optionsToUse, requestLogger, url);

    /**
     * Now, let's do the infrastructure bits for tracing this request with
     * some useful logging data and removing completed requests from our
     * in flight list.
     */
    const finalizedPromise = abortableRequest
        .then((res) => {
            const currentRequestCacheID = options?.getCacheID?.();
            traceSession.addLabel(
                "source",
                getResponseSource(res, currentRequestCacheID),
            );
            traceSession.addLabel("successful", true);
            return res;
        })
        .catch((e) => {
            // Let's log why this request failed since JSDOM may not share that
            // info with us.
            requestLogger.error("Request failed", extractError(e));
            throw e;
        })
        .finally(() => {
            traceSession.addLabel("retries", retryCount);
            traceSession.end();
        });

    /**
     * Finally, we need to turn the promise back into an abortable and add it
     * to our list of in flight requests.
     */
    const finalizedRequest: AbortablePromise<Response> =
        finalizedPromise as any;
    finalizedRequest.abort = () => abortableRequest.abort();
    Object.defineProperty(finalizedRequest, "aborted", {
        get: () => abortableRequest.aborted,
    });
    return finalizedRequest;
};
