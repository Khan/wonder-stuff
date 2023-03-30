import {URL} from "url";
import type {Agent as HttpAgent} from "http";
import type {Agent as HttpsAgent} from "https";
import {ResourceLoader} from "jsdom";
import type {FetchOptions} from "jsdom";
import {getAgentForURL} from "@khanacademy/wonder-stuff-server";
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import {Requests} from "@khanacademy/wonder-stuff-render-server";
import type {
    RequestOptions,
    RenderAPI,
    AbortablePromise,
} from "@khanacademy/wonder-stuff-render-server";
import {applyAbortablePromisesPatch} from "./apply-abortable-promises-patch";

const noop = () => {
    /* empty */
};

/**
 * A ResourceLoader implementation for JSDOM that only allows for fetching JS
 * files, and provides the ability to handle and modify the fetch return result.
 *
 * This can be useful for various things, such as intercepting script requests
 * to execute them in a different manner than letting the DOM use a script tag.
 * The return result could then be an empty string rather than the full script.
 *
 * The caller is responsible for maintaining script order based on call order.
 *
 * A JS file request is identified by the regular expression:
 *   /^.*\.js(?:\?.*)?/g
 */
export class JSDOMResourceLoader extends ResourceLoader {
    /**
     * Used to indicate if any pending requests are still needed so that we
     * can report when an unused request is fulfilled.
     */
    _active: boolean;
    _renderAPI: RenderAPI;
    _requestOptions: RequestOptions;
    _agents: {
        [protocol: string]: HttpAgent | HttpsAgent;
    };
    _handleFetchResult:
        | ((
              result: Promise<Buffer> | void,
              url: string,
              options: FetchOptions,
          ) => Promise<Buffer> | void)
        | void;

    static get EMPTY_RESPONSE(): AbortablePromise<Buffer> {
        const response = Promise.resolve(
            Buffer.from(""),
        ) as AbortablePromise<Buffer>;
        response.abort = noop;
        return response;
    }

    /**
     * Create instance of the resource loader.
     *
     * @param {RenderAPI} RenderAPI The render API that provides things like
     * the logger.
     * @param {RequestOptions} [requestOptions] Options that calibrate how
     * requests are performed for this loader.
     * @param {(result: ?Promise<Buffer>, url: string, options?: FetchOptions) => ?Promise<Buffer>}
     * A callback that is invoked with the promise result. This can be used
     * to ensure additional work is done on each request within the loader
     * cycle, before the JSDOM call receives the result.
     */
    constructor(
        renderAPI: RenderAPI,
        requestOptions: RequestOptions = Requests.DefaultRequestOptions,
        handleFetchResult?: (
            result: Promise<Buffer> | void,
            url: string,
            options: FetchOptions,
        ) => Promise<Buffer> | void,
    ) {
        // Patch before super to make sure promises get an abort.
        applyAbortablePromisesPatch();

        super();

        if (renderAPI == null) {
            throw new KindError("Must provide render API.", Errors.Internal);
        }

        this._active = true;
        this._renderAPI = renderAPI;
        this._requestOptions = requestOptions;
        this._agents = {};
        this._handleFetchResult = handleFetchResult;
    }

    _getAgent(url: string): HttpAgent | HttpsAgent {
        const parsedURL = new URL(url);
        const agent =
            this._agents[parsedURL.protocol] || getAgentForURL(parsedURL);
        this._agents[parsedURL.protocol] = agent;
        return agent;
    }

    get isActive(): boolean {
        return this._active;
    }

    close(): void {
        this._active = false;

        /**
         * We need to destroy any agents we created or they may retain
         * sockets that retain references to our JSDOM environment and cause
         * a memory leak.
         */
        for (const key of Object.keys(this._agents)) {
            this._agents[key].destroy();
            delete this._agents[key];
        }
    }

    fetch(url: string, options: FetchOptions): AbortablePromise<Buffer> | null {
        const logger = this._renderAPI.logger;
        const isInlineData = url.startsWith("data:");
        const readableURLForLogging = isInlineData ? "inline data" : url;
        if (!this._active) {
            /**
             * If we get here, then something is trying to fetch when our
             * environment has closed us down. This could be in the reject
             * or resolve of a promise, for example.
             *
             * If it's inlinedata, it really doesn't matter, so let's log it
             * only if it's for a file.
             */
            if (!isInlineData) {
                logger.warn(
                    `File fetch attempted after resource loader close: ${readableURLForLogging}`,
                );
            }

            /**
             * Though we intentionally don't want to load this file, we can't
             * just return null per the spec as this can break promise
             * resolutions that are relying on this file. Instead, we resolve
             * as an empty string so things can tidy up properly.
             */
            return JSDOMResourceLoader.EMPTY_RESPONSE;
        }

        /**
         * We must still be active.
         * If this request is not a JavaScript file, we are going to return an
         * empty response as we don't care about non-JS resources.
         */
        const JSFileRegex = /^.*\.js(?:\?.*)?/g;
        if (!JSFileRegex.test(url)) {
            logger.silly(`EMPTY: ${readableURLForLogging}`);

            /**
             * Though we intentionally don't want to load this file, we can't
             * just return null per the spec as this can break promise
             * resolutions that are relying on this file. Instead, we resolve
             * as an empty string so things can tidy up properly.
             */
            return JSDOMResourceLoader.EMPTY_RESPONSE;
        }

        /**
         * This must be a JavaScript file request. Let's make a request for the
         * file and then handle it coming back.
         */
        const abortableFetch = Requests.request(logger, url, {
            ...this._requestOptions,
            agent: this._getAgent(url),
        });
        const handleInactive = abortableFetch.then((response) => {
            const {aborted} = abortableFetch;
            if (!this._active || aborted) {
                if (!aborted) {
                    logger.info(
                        `File requested but never used: ${readableURLForLogging}`,
                    );
                }

                /**
                 * Just return an empty buffer so no code executes. The
                 * request function passed at construction will have handled
                 * caching of the real file request.
                 */
                return Buffer.from("");
            }

            /**
             * Our requests are always buffered.
             *
             * This is OK because we limit our requests to only text files.
             * If this code were downloading binary data, this would not be
             * helpful and we may want to consider using the default buffer
             * setup that only buffers for things where a parser is available.
             *
             * Let's worry about that later.
             */
            return Buffer.from(response.text);
        });

        /**
         * If we have a custom handler, we now let that do work.
         */
        const finalResult =
            this._handleFetchResult == null
                ? handleInactive
                : this._handleFetchResult(handleInactive, url, options);

        /**
         * We have to turn this back into an abortable promise so that JSDOM
         * can abort it when closing, if it needs to.
         */
        const abortableFinalResult: AbortablePromise<Buffer> =
            finalResult as AbortablePromise<Buffer>;
        abortableFinalResult.abort = abortableFetch.abort;
        Object.defineProperty(abortableFinalResult, "aborted", {
            get: () => abortableFetch.aborted,
        });

        return abortableFinalResult;
    }
}
