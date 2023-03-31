import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {
    RenderAPI,
    ICloseable,
} from "@khanacademy/wonder-stuff-render-server";
import type {IJSDOMConfiguration, CloseableResourceLoader} from "./types";

/**
 * Utility for creating a valid configuration to use with the JSDOM environment.
 */
export class JSDOMConfiguration implements IJSDOMConfiguration {
    readonly registrationCallbackName: string;
    readonly getFileList: (
        url: string,
        renderAPI: RenderAPI,
        fetchFn: (url: string) => Promise<Buffer> | null | undefined,
    ) => Promise<Array<string>>;
    readonly getResourceLoader: (
        url: string,
        renderAPI: RenderAPI,
    ) => CloseableResourceLoader;
    readonly afterEnvSetup: (
        url: string,
        fileURLs: ReadonlyArray<string>,
        renderAPI: RenderAPI,
        vmContext?: any,
    ) => Promise<ICloseable | null | undefined>;

    /**
     * Create a configuration for use with the JSDOM  environment.
     *
     * @param {(url: string, renderAPI: RenderAPI) => Promise<Array<string>>} getFileList
     * Callback that should return a promise for the list of JavaScript files
     * the environment must execute in order to produce a result for the given
     * render request.
     * @param {(url: string, renderAPI: RenderAPI) => ResourceLoader} getResourceLoader
     * Callback that should return a JSDOM resource loader for the given
     * request. We must call this per render so that logging is appropriately
     * channeled for the request being made.
     * @param {(url: string, fileURLs: $ReadOnlyArray<string>, renderAPI: RenderAPI, vmContext: any) => ?Promise<mixed>} [afterEnvSetup]
     * Callback to perform additional environment setup before the render
     * occurs. This can optionally return an object that can add extra fields
     * to the environment context for rendering code to access. This is useful
     * if your render server wants to add some specific configuration, such
     * as setting up some versions of Apollo for server-side rendering.
     * Be careful; any functions you attach can be executed by the rendering
     * code.
     * @param {string} [registrationCallbackName] The name of the function
     * that the environment should expose for client code to register for
     * rendering. This defaults to `__jsdom_env_register`.
     */
    constructor(
        getFileList: (
            url: string,
            renderAPI: RenderAPI,
            fetchFn: (url: string) => Promise<Buffer> | null | undefined,
        ) => Promise<Array<string>>,
        getResourceLoader: (
            url: string,
            renderAPI: RenderAPI,
        ) => CloseableResourceLoader,
        afterEnvSetup?: (
            url: string,
            fileURLs: ReadonlyArray<string>,
            renderAPI: RenderAPI,
            vmContext?: any,
        ) => Promise<ICloseable | null | undefined>,
        registrationCallbackName = "__jsdom_env_register",
    ) {
        if (typeof getFileList !== "function") {
            throw new KindError(
                "Must provide valid callback for obtaining file list",
                Errors.Internal,
            );
        }
        if (typeof getResourceLoader !== "function") {
            throw new KindError(
                "Must provide valid callback for obtaining resource loader",
                Errors.Internal,
            );
        }
        if (afterEnvSetup != null && typeof afterEnvSetup !== "function") {
            throw new KindError(
                "Must provide valid callback for after env setup or null",
                Errors.Internal,
            );
        }

        this.registrationCallbackName = registrationCallbackName;
        this.getFileList = getFileList;
        this.getResourceLoader = getResourceLoader;
        this.afterEnvSetup = afterEnvSetup || (() => Promise.resolve(null));
    }
}
