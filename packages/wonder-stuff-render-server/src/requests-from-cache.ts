import type {SuperAgentRequest, Response} from "superagent";
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {ResponseSource, RequestOptions, AbortablePromise} from "./types";

/**
 * This is the name of the property we attach to responses so that we can
 * indicate if a response was from the cache or not.
 */
export const CACHE_ID_PROP_NAME = "_cacheID";

/**
 * Determine the source of a superagent response.
 *
 * @param {SuperAgentResponse} response The response to check.
 * @param {string} cacheID The cacheID for items that are freshly added to the
 * cache in the current request.
 * @returns {ResponseSource} "cache" if the response was from cache,
 * "new request" if it was not from cache, or "unknown" if a cache state cannot
 * be determined.
 */
export const getResponseSource = (
    response: Response,
    cacheID?: string | null,
): ResponseSource => {
    // @ts-expect-error We know that the response doesn't define this prop.
    const responseCacheID = response[CACHE_ID_PROP_NAME];

    // If the cacheID to compare or the cache ID of the response are nully,
    // then we have no idea about the cache state.
    if (cacheID == null || responseCacheID == null) {
        return "unknown";
    }

    // If the response cacheID and the passed in cacheID are the same, then
    // we assume that the response was cached during the current request and
    // therefore, it was not taken from the existing cache.
    return responseCacheID === cacheID ? "new request" : "cache";
};

/**
 * Turn unbuffered, uncached request into uncached request with buffer.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {Request} request The request to be modified.
 * @returns {Promise<Response>} A superagent request supporting caching for the
 * given URL.
 */
export const asUncachedRequest = (
    request: SuperAgentRequest,
): AbortablePromise<Response> => {
    /**
     * We just return the superagent request. It is already abortable.
     */
    const superagentRequest = request.buffer(true);
    return superagentRequest as any;
};

/**
 * Turn unbuffered, uncached request into cached request with or without buffer.
 *
 * Could resolve from cache if caching is enabled and the request has already
 * been fulfilled once. Otherwise, this creates a new request for the URL.
 *
 * The request will resolve with an additional property to indicate if it was
 * resolved from cache or not.
 *
 * @param {RequestOptions} options Used to determine caching setup and whether
 * the request should be buffered or not.
 * @param {Request} request The request to be modified.
 * @returns {Promise<Response>} A superagent request supporting caching for the
 * given URL.
 */
export const asCachedRequest = (
    options: RequestOptions,
    request: SuperAgentRequest,
): AbortablePromise<Response> => {
    const {cachePlugin, getExpiration} = options;
    if (cachePlugin == null) {
        throw new KindError(
            "Cannot cache request without cache plugin instance.",
            Errors.NotAllowed,
        );
    }

    /**
     * We need to ensure that what we return has the `abort` method still so
     * that we can let things like JSDOM call abort on promises.
     */
    const superagentRequest = request
        .use(cachePlugin)
        .expiration(getExpiration?.(request.url))
        .prune(
            (
                response: Response,
                gutResponse: (response: Response) => Response,
            ) => {
                /**
                 * This is called to prune a response before it goes into the
                 * cache.
                 *
                 * We want to use our own `prune` method so that we can track
                 * what comes from cache versus what doesn't.
                 *
                 * But we still do the same thing that superagent-cache would
                 * do, for now.
                 */
                const guttedResponse = gutResponse(response);
                const cacheID = options.getCacheID?.();
                if (cacheID != null) {
                    // @ts-expect-error We know that the response doesn't
                    // define this prop.
                    guttedResponse[CACHE_ID_PROP_NAME] = cacheID;
                }
                return guttedResponse;
            },
        )
        .buffer(true);

    // We know this is abortable.
    return superagentRequest as any;
};
