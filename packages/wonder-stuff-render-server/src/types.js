// @flow
import type {Agent as HttpAgent} from "http";
import type {Agent as HttpsAgent} from "https";
import type {$Response} from "express";
import type {CallbackHandler, Plugin} from "superagent";
import type {SecretString} from "@khanacademy/wonder-stuff-core";
import type {
    Logger,
    ServerOptions,
    ITraceSession,
} from "@khanacademy/wonder-stuff-server";

/**
 * A thing that can be closed.
 */
export interface ICloseable {
    /**
     * Close the closeable.
     */
    +close?: () => ?Promise<void>;
}

export type ResponseSource = "unknown" | "cache" | "new request";

/**
 * Represents an error and associated stack.
 */
export type SimplifiedError = {
    /**
     * A string representing the error that occurred.
     * In some circumstances, this will match the stack property.
     */
    +error: ?string,

    /**
     * The error's stack, if it has one.
     */
    +stack?: string,

    /**
     * Additional properties that the source error had.
     */
    +props?: {
        +[key: string]: string | number | boolean,
        ...
    },
};

/**
 * Represents an error when we don't really know how it is structured.
 *
 * Use extractError to turn this into a SimplifiedError representation.
 */
export type AmbiguousError =
    | SimplifiedError
    | string
    | {
          error?: AmbiguousError,
          response?: {
              error?: string,
          },
          stack?: string,
          message?: string,
          name?: string,
          ...
      }
    | Error;

/**
 * Options for configuring incoming request authentication.
 */
export type AuthenticationOptions = {
    /**
     * The key of the secret that must be matched.
     *
     * This secret is loaded from the secrets.json.enc file that the service
     * must provide.
     */
    +secretKey: string,

    /**
     * The key of the secret that we are deprecating.
     *
     * This secret is loaded from the secrets.json.enc file that the service
     * must provide. It is there so that we can rotate out a deprecated secret
     * without impairing functionality.
     */
    +deprecatedSecretKey?: string,

    /**
     * The name of the header to be matched.
     *
     * This is a header in the request, the value of which will be matched
     * against the secret identified by `secretKey`.
     */
    +headerName: string,

    /**
     * The Google Cloud KMS cryptography key path.
     *
     * This is the KMS path used to decode the secrets.json.enc file so that
     * the secret identifed by `secretKey` can be obtained.
     */
    +cryptoKeyPath: string,
};

/**
 * A promise that has an abort() method.
 */
export interface AbortablePromise<T> extends Promise<T> {
    abort: () => void;
    aborted: boolean;
}

export interface TraceCallback {
    /**
     * Begin a trace session.
     *
     * @param {string} action A terse name of the traced action.
     * @param {string} message A message to be logged for this trace.
     * @returns {ITraceSession} A trace session that the caller should use to
     * indicate when the session is finished.
     */
    (action: string, message: string): ITraceSession;
}

/**
 * The result of an error handling operation.
 */
export type ErrorResult = {
    /**
     * The body of the response that is to be sent back from the gateway.
     */
    +body: string,

    /**
     * Headers to be attached to the response.
     */
    +headers: ResponseHeaders,
};

export interface CustomErrorHandlerFn {
    /**
     * Provide a response body for the given error.
     *
     * @param {string} url The URL that we were trying to render.
     * @param {SimplifiedError} error The error to be handled.
     * @returns {?ErrorResult|?Promise<ErrorResult>} An error result or the
     * promise of an error result to be returned for the error,
     * or, `null` if the original error is to be given.
     */
    (
        url: string,
        headers: any,
        error: SimplifiedError,
    ): ?ErrorResult | ?Promise<ErrorResult>;
}

/**
 * Header names and their values for attaching to a response from the gateway.
 */
export type ResponseHeaders = {
    [name: string]: string,
    ...
};

/**
 * The result of a render operation.
 */
export type RenderResult = {
    /**
     * The body of the response that is to be sent back from the gateway.
     */
    +body: string,

    /**
     * The HTTP status code.
     */
    +status: number,

    /**
     * Headers to be attached to the response.
     */
    +headers: ResponseHeaders,
};

/**
 * The API exposed for use during a render operation.
 */
export type RenderAPI = {
    /**
     * A dict of headers that've come from the client.
     *
     * Access of these headers should be tracked and a Vary header should be
     * set based on their access (even if they don't exist).
     */
    headers: {[header: string]: string, ...},

    /**
     * Callback to start a trace session for tracing an operation.
     */
    +trace: TraceCallback,

    /**
     * A logger to use for logging during the render operation.
     */
    +logger: Logger,
};

/**
 * Options for configuring the gateway.
 */
export type RenderGatewayOptions = {
    /**
     * The name of the gateway service.
     */
    +name: string,

    /**
     * The port on which the gateway service will listen.
     */
    +port: number,

    /**
     * The hostname to which the gateway service should bind.
     */
    +host: string,

    /**
     * Optional value in milliseconds for keepalive timeout of the server.
     * For running in Google Cloud, this should be higher than the load
     * balancer's own keepalive timeout value, which at time of writing was
     * indicated to be 80000ms [1].
     *
     * [1] https://khanacademy.slack.com/archives/CJSE4TMQX/p1573252787333500
     *
     * Defaults to 90000.
     */
    +keepAliveTimeout?: number,

    /**
     * Options to indicate how to authenticate incoming render requests.
     */
    +authentication?: AuthenticationOptions,

    /**
     * The environment that will handle rendering.
     */
    +renderEnvironment: IRenderEnvironment,

    /**
     * Handler that will be invoked if a render request causes an exception.
     *
     * This provides the running server with an opportunity to override the
     * default uncaught error response and provide a more friendly message.
     */
    +uncaughtRenderErrorHandler?: CustomErrorHandlerFn,

    /**
     * A string that will be used to build an error response for a failed
     * render if all other error handling options fail.
     *
     * If the sequence ${error} appears in the string, it will be replaced
     * with the JSONified error information. If it does not appear, the
     * JSONified error information will be omitted (useful if you don't want
     * to include that for users).
     */
    +defaultRenderErrorResponse?: string,

    /**
     * Specify which cloud facilities we want.
     */
    +cloudOptions?: ServerOptions["integrations"],
};

/**
 * The request type that we use with express.
 *
 * STOPSHIP: Had to do this because in Flow, $Request is not compatible with
 * the flow type exported by Wonder Stuff. NO point in fixing as this will
 * go away with the migration.
 */
export type Request = any; //RequestWithLog<$Request>;

/**
 * The response type that we use with express.
 */
export type Response = $Response;

/**
 * Timeouts for a request.
 */
export type Timeouts = {
    /**
     * The total time the request is allowed to take before it times out.
     */
    deadline?: number,

    /**
     * The time to wait for a response before a request times out.
     */
    response?: number,
};

/**
 * Options to configure a request.
 */
export type RequestOptions = {
    /**
     * Time to wait in milliseconds before a request times out.
     */
    +timeout: number | Timeouts,

    /**
     * The number of times a request is retried if it fails from a transient
     * error. This is in addition to the initial request. For example, if this
     * were set to 3, then there could be a total of 4 requests.
     * Note that for all GET requests made during server-side rendering,
     * it is assumed they will be idempotent.
     */
    +retries: number,

    /**
     * The agent to be used for the request.
     */
    +agent?: HttpAgent | HttpsAgent,

    /**
     * The superagent-cache-plugin instance that will be used.
     */
    +cachePlugin?: Plugin,

    /**
     * A callback to calculate when the cached response for a given URL should
     * expire. If this method is omitted, the cache provider's default
     * expiration will be used. The result is given to superagent-cache-plugin
     * and works according to its documentation.
     *
     * https://github.com/jpodwys/superagent-cache-plugin/tree/02e41c5b98c89318133d4736b2bd1abcc1866bab
     */
    +getExpiration?: (url: string) => ?number,

    /**
     * A callback used to determine if a particular URL's result should be
     * cached or not. This defaults to only allowing JS file extensions to be
     * stored. This callback should return null for the default behavior to
     * apply.
     */
    +isCacheable?: (url: string) => ?boolean,

    /**
     * Callback invoked if a retry occurs.
     * This should return null for the default behavior to apply, true to allow
     * the retry, and false to block further retries.
     *
     * Returning a non-boolean value causes superagent to do its default
     * behavior, which is:
     * - allow retry for all 500 errors except 501
     * - allow retry for err.code set to any:
     *      ['ECONNRESET', 'ETIMEDOUT', 'EADDRINFO', 'ESOCKETTIMEDOUT']
     * - allow retry if err.timeout is truthy and err.code is 'ECONNABORTED`
     * - allow retry if err.crossDomain is truthy
     */
    +shouldRetry?: CallbackHandler,

    /**
     * Call to obtain a cache-safe identifier the currently handled request.
     *
     * This is used to identify the request when comparing with cached
     * responses so that we can determine if a response was fulfilled from
     * cache or from a fresh request.
     *
     * Without an implementation of this method, it is not possible to
     * determine if something is from cache or not.
     */
    +getCacheID?: () => string,
};

/**
 * Represents an environment that can perform renders.
 *
 * This allows for simple rendering strategies where each render is completely
 * standalong (as per the old react-render-server), or more complex rendering
 * strategies where some amount of the rendering environment state is shared
 * across renders.
 */
export interface IRenderEnvironment {
    /**
     * Generate a render result for the given url.
     *
     * @param {string} url The URL that is to be rendered. This is always
     * relative to the host and so does not contain protocol, hostname, nor port
     * information.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {Promise<RenderResult>} The result of the render that is to be
     * returned by the gateway service as the response to the render request.
     * This includes the body of the response and the status code information.
     */
    render(url: string, renderAPI: RenderAPI): Promise<RenderResult>;
}

/**
 * Configuration of secrets lookup.
 *
 * One variation provides a Google Cloud KMS configuration; the other provides
 * means to map secrets dynamically.
 */
export type SecretsConfig =
    | {
          /**
           * A Google Cloud KMS crpyto key path. This is required in
           * production.
           */
          cryptoKeyPath: string,
      }
    | {
          /**
           * The absolute path of the root folder for the service.
           */
          serviceRootPath: string,
          /**
           * A function used to lookup a secret by name.
           */
          lookupFn: (name: string, config: string) => ?SecretString,
      };
