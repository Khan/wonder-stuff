// @flow
import superagent from "superagent";
import type {Request} from "superagent";
import {getAppEngineInfo} from "@khanacademy/wonder-stuff-server";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import type {RequestOptions} from "./types";
import {makeShouldRetry} from "./make-should-retry";

/**
 * Make a request for a given URL without buffering or caching.
 *
 * This is not intended for direct use. Use makeRequest.
 *
 * @param {RenderGatewayOptions} options The options used to start the gateway.
 * @param {Logger} logger The logger to use.
 * @param {string} url The URL to be requested.
 * @returns {SuperAgentRequest} A superagent request for the URL.
 */
export const makeUnbufferedNoCacheRequest = (
    options: RequestOptions,
    logger: Logger,
    url: string,
): Request => {
    const {name, version} = getAppEngineInfo();
    return (
        superagent
            .get(url)
            .agent(options.agent)
            /**
             * Configure retries since superagent can handle this for us.
             * We give it a callback so we can log the retry and, if we so choose
             * in the future, decide whether we should allow any more. This would
             * allow us to short circuit the retry count (the max retries still
             * takes precedence over our callback response, so we can't retry
             * forever).
             */
            .retry(
                options.retries,
                makeShouldRetry(logger, options.shouldRetry),
            )
            /**
             * We add a user agent header so that we can easily identify our
             * requests in logs.
             *
             * The header has a form like:
             *     SERVICE_NAME_HERE (VERSION_STRING_HERE)
             */
            .set("User-Agent", `${name} (${version})`)
            .timeout(options.timeout)
    );
};
