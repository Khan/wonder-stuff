import type {ResourceLoader} from "jsdom";
import type {
    RenderAPI,
    ICloseable,
} from "@khanacademy/wonder-stuff-render-server";

/**
 * Gate API for control flow.
 */
export interface IGate extends ICloseable {
    /**
     * Open the gate.
     */
    open(): void;
    /**
     * Close the gate.
     */
    close: () => Promise<void> | void;
    /**
     * True, if the gate is open; otherwise, false.
     */
    get isOpen(): boolean;
}

/**
 * Standard timer API as implemented by Node's global or a browser window.
 */
export interface ITimerAPI {
    setTimeout: (typeof window)["setTimeout"];
    setInterval: (typeof window)["setInterval"];
    requestAnimationFrame: (typeof window)["requestAnimationFrame"];
}

/**
 * A resource loader for use with JSDOM that can also have a close method for
 * tidying up resources deterministically.
 */
export interface CloseableResourceLoader extends ResourceLoader, ICloseable {
    /**
     * Close the resource loader and tidy up resources.
     *
     * This is optional.
     */
    readonly close?: () => void;
}

/**
 * Configuration for a JSDOM environment.
 */
export interface IJSDOMConfiguration {
    /**
     * The name of the callback function that should be exposed by the
     * environment for renderable code to use when registering for rendering.
     */
    get registrationCallbackName(): string;
    /**
     * Get a JSDOM resource loader for the given render request.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @returns {CloseableResourceLoader} A ResourceLoader instance for use
     * with JSDOM that can optionally have a close() method, which will be
     * invoked when the render completes.
     */
    getResourceLoader(
        url: string,
        renderAPI: RenderAPI,
    ): CloseableResourceLoader;
    /**
     * Get the list of file URLs to retrieve and execute for the given request.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @param {(url: string) => ?Promise<Buffer>} fetchFn
     * Function to fetch a URL. Using this ensures proper tidy-up of associated
     * sockets and agents.
     * @returns {Promise<Array<string>>} An ordered array of absolute URLs for
     * the JavaScript files that are to be executed. These are exectued in the
     * same order as the array.
     */
    getFileList(
        url: string,
        renderAPI: RenderAPI,
        fetchFn: (url: string) => Promise<Buffer> | null | undefined,
    ): Promise<Array<string>>;
    /**
     * Perform any additional environment setup.
     *
     * This method gets access to the actual environment in which code will
     * execute. Be careful what you do.
     *
     * @param {string} url The URL that is to be rendered.
     * @param {RenderAPI} renderAPI An API of utilities for assisting with the
     * render operation.
     * @param {any} vmContext The actual environment that is being setup.
     * @returns {?Promise<void>} A promise that the additional setup is done.
     */
    afterEnvSetup(
        url: string,
        fileURLs: ReadonlyArray<string>,
        renderAPI: RenderAPI,
        vmContext?: any,
    ): Promise<ICloseable | null | undefined>;
}
