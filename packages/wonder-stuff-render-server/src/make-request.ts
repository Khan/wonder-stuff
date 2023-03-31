import type {Response as SuperAgentResponse} from "superagent";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import type {RequestOptions, AbortablePromise} from "./types";
import {isCacheable} from "./is-cacheable";
import {makeUnbufferedNoCacheRequest} from "./make-unbuffered-no-cache-request";
import {asCachedRequest, asUncachedRequest} from "./requests-from-cache";

/**
 * Make a request for a given URL
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional property, which will
 * indicate if it was resolved from cache or not.
 *
 * @param {RequestOptions} options The options used to configure the request.
 * @param {Logger} logger The logger to use.
 * @param {string} url The URL to be requested.
 * @returns {Promise<SuperAgentResponse>} A superagent request for the URL.
 */
export const makeRequest = (
    options: RequestOptions,
    logger: Logger,
    url: string,
): AbortablePromise<SuperAgentResponse> => {
    /**
     * Create the base request with our various options.
     */
    const request = makeUnbufferedNoCacheRequest(options, logger, url);
    // We know request doesn't have this, but we want it to have this, so we're
    // adding it.
    Object.defineProperty(request, "aborted", {
        // @ts-expect-error We happen to know that this internal property
        // exists.
        get: () => request._aborted,
    });

    /**
     * We only add caching support if we were given a cache to use.
     * We also make sure that this request is something we want to cache.
     * We default to JS files only, but this can be overridden in the gateway
     * options.
     */
    if (options.cachePlugin && isCacheable(url, options.isCacheable)) {
        /**
         * If we get here, we are caching this request.
         */
        return asCachedRequest(options, request);
    }

    /**
     * We're not caching this request, so let's just not set caching up.
     */
    return asUncachedRequest(request);
};
