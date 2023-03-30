import type vm from "vm";
import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "@khanacademy/wonder-stuff-server";
import type {Logger, ITraceSession} from "@khanacademy/wonder-stuff-server";
import {extractError} from "@khanacademy/wonder-stuff-render-server";
import type {
    AmbiguousError,
    IRenderEnvironment,
    RenderAPI,
    RenderResult,
    ICloseable,
} from "@khanacademy/wonder-stuff-render-server";
import type {
    IJSDOMConfiguration,
    CloseableResourceLoader,
    IGate,
} from "./types";

interface RenderCallbackFn {
    /**
     * Method invoked to create a render result.
     */
    (): Promise<RenderResult>;
}

/**
 * A JS file.
 */
type JavaScriptFile = {
    /**
     * The content of the file.
     */
    readonly content: string;
    /**
     * The URL of the file.
     */
    readonly url: string;
};

type JavaScriptFiles = {
    readonly files: ReadonlyArray<JavaScriptFile>;
    readonly urls: ReadonlyArray<string>;
};

const MinimalPage = "<!DOCTYPE html><html><head></head><body></body></html>";

/**
 * A render environment built to support the JSDOM 16.x API.
 */
export class JSDOMEnvironment implements IRenderEnvironment {
    _configuration: IJSDOMConfiguration;

    /**
     * Create a new instance of this environment.
     *
     * @param {IJSDOMConfiguration} configuration
     * Configuration for the environment.
     */
    constructor(configuration: IJSDOMConfiguration) {
        if (configuration == null) {
            throw new KindError(
                "Must provide environment configuration",
                Errors.Internal,
            );
        }
        this._configuration = configuration;
    }

    _retrieveTargetFiles: (
        url: string,
        renderAPI: RenderAPI,
        resourceLoader: CloseableResourceLoader,
    ) => Promise<JavaScriptFiles> = async (
        url: string,
        renderAPI: RenderAPI,
        resourceLoader: CloseableResourceLoader,
    ): Promise<JavaScriptFiles> => {
        const traceSession: ITraceSession = renderAPI.trace(
            "JSDOM16._retrieveTargetFiles",
            `JSDOMEnvironment retrieving files`,
        );
        try {
            /**
             * First, we need to know what files to execute so that we can
             * produce a render result, and we need a resource loader so that
             * we can retrieve those files as well as support retrieving
             * additional files within our JSDOM environment.
             */
            const fileURLs = await this._configuration.getFileList(
                url,
                renderAPI,
                (url) => resourceLoader.fetch(url, {}),
            );
            traceSession.addLabel("fileCount", fileURLs.length);

            /**
             * Now let's use the resource loader to get the files.
             * We ignore the `FetchOptions` param of resourceLoader.fetch as we
             * have nothing to pass there.
             */
            return {
                files: await Promise.all(
                    fileURLs.map((f) => {
                        const fetchResult = resourceLoader.fetch(f, {});
                        /**
                         * Resource loader's fetch can return null. It shouldn't for
                         * any of these files though, so if it does, let's raise an
                         * error!
                         */
                        if (fetchResult == null) {
                            throw new KindError(
                                `Unable to retrieve ${f}. ResourceLoader returned null.`,
                                Errors.TransientService,
                            );
                        }
                        /**
                         * No need to reconnect the abort() in this case since we
                         * won't be calling it.
                         */
                        return fetchResult.then((b) => ({
                            content: b.toString(),
                            url: f,
                        }));
                    }),
                ),
                urls: fileURLs,
            };
        } finally {
            traceSession.end();
        }
    };

    _closeAll(
        closeables: Array<ICloseable | null | undefined>,
        logger: Logger,
    ): Promise<void> {
        return new Promise((resolve) => {
            /**
             * We wrap this in a timeout to hopefully mitigate any chances
             * of https://github.com/jsdom/jsdom/issues/1682
             */
            setTimeout(async () => {
                const reportCloseableError = (e: AmbiguousError) => {
                    // We do not want to stop closing just because something
                    // errored.
                    const simplifiedError = extractError(e);
                    logger.error(
                        `Closeable encountered an error: ${
                            simplifiedError.error || ""
                        }`,
                        {
                            ...simplifiedError,
                            kind: Errors.Internal,
                        },
                    );
                };
                /**
                 * We want to close things. We're going to assume that
                 * things are robust to change and close everything at once.
                 * That way we shutdown as fast as we can, and any "closed"
                 * states that are set on close to gate things like wasted
                 * JS requests are properly entered as soon as possible.
                 */
                await Promise.all(
                    closeables.map((c) => {
                        try {
                            return c?.close?.()?.catch(reportCloseableError);
                        } catch (e: any) {
                            reportCloseableError(e);
                        }
                    }),
                );

                /**
                 * Let's clear the array to make sure we're not holding
                 * on to any references unnecessarily.
                 */
                closeables.length = 0;
                resolve();
            });
        });
    }

    async _runScript<T>(
        vmContext: vm.Context,
        script: string,
        options?: vm.ScriptOptions,
    ): Promise<T> {
        const {Script} = await import("vm");
        const realScript = new Script(script, options);
        return realScript.runInContext(vmContext);
    }

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
    render: (url: string, renderAPI: RenderAPI) => Promise<RenderResult> =
        async (url: string, renderAPI: RenderAPI): Promise<RenderResult> => {
            /**
             * We want to tidy up nicely if there's a problem and also if the render
             * context is closed, so let's handle that by putting closeable things
             * into a handy list and providing a way to close them all.
             */
            const closeables: Array<ICloseable | null | undefined> = [];
            try {
                /**
                 * We are going to need a resource loader so that we can obtain files
                 * both inside and outside the JSDOM VM.
                 */
                const resourceLoader = this._configuration.getResourceLoader(
                    url,
                    renderAPI,
                );
                closeables.push(resourceLoader);

                // Let's get those files!
                const files = await this._retrieveTargetFiles(
                    url,
                    renderAPI,
                    resourceLoader,
                );

                /**
                 * We want a JSDOM instance for the url we want to render. This is
                 * where we setup custom resource loading and our virtual console
                 * too.
                 */
                const {JSDOM} = await import("jsdom");
                const {CloseableVirtualConsole} = await import(
                    "./closeable-virtual-console"
                );
                const virtualConsole = new CloseableVirtualConsole(
                    renderAPI.logger,
                );
                const jsdomInstance = new JSDOM(MinimalPage, {
                    url,
                    runScripts: "dangerously",
                    resources: resourceLoader as any,
                    pretendToBeVisual: true,
                    virtualConsole,
                });
                closeables.push(virtualConsole);
                closeables.push(jsdomInstance.window);

                /**
                 * OK, we know this is a JSDOM instance but we want to expose a nice
                 * wrapper. As part of that wrapper, we want to make it easier to
                 * run scripts (like our rendering JS code) within the VM context.
                 * So, let's create a helper for that.
                 *
                 * We cast the context to any, because otherwise it is typed as an
                 * empty object, which makes life annoying.
                 */
                const vmContext: any = jsdomInstance.getInternalVMContext();

                /**
                 * Next, we want to patch timers so we can make sure they don't
                 * fire after we are done (and so we can catch dangling timers if
                 * necessary). To do this, we are going to hang the timer API off
                 * the vmContext and then execute it from inside the context.
                 * Super magic.
                 */
                const tmpFnName = "__tmp_patchTimers";
                const {patchAgainstDanglingTimers} = await import(
                    "./patch-against-dangling-timers"
                );
                vmContext[tmpFnName] = patchAgainstDanglingTimers;
                const timerGateAPI: IGate = await this._runScript(
                    vmContext,
                    `${tmpFnName}(window);`,
                );
                delete vmContext[tmpFnName];
                closeables.push(timerGateAPI);

                /**
                 * At this point, we give our configuration an opportunity to
                 * modify the render context and capture the return result, which
                 * can be used to tidy up after we're done.
                 */
                const afterRenderTidyUp =
                    await this._configuration.afterEnvSetup(
                        url,
                        files.urls,
                        renderAPI,
                        vmContext,
                    );
                closeables.push(afterRenderTidyUp);

                /**
                 * At this point, before loading the files for rendering, we must
                 * configure the registration point in our render context.
                 */
                const {registrationCallbackName} = this._configuration;
                const registeredCbName = "__registeredCallback";
                vmContext[registrationCallbackName] = (
                    cb: RenderCallbackFn,
                ): void => {
                    vmContext[registrationCallbackName][registeredCbName] = cb;
                };
                closeables.push({
                    close: () => {
                        delete vmContext[registrationCallbackName];
                    },
                });

                /**
                 * The context is configured. Now we need to load the files into it
                 * which should cause our registration callback to be invoked.
                 * We pass the filename here so we can get some nicer stack traces.
                 */
                await Promise.all(
                    files.files.map(({content, url}) =>
                        this._runScript(vmContext, content, {filename: url}),
                    ),
                );

                /**
                 * With the files all loaded, we should have a registered callback.
                 * Let's assert that and then invoke the render process.
                 */
                if (
                    typeof vmContext[registrationCallbackName][
                        registeredCbName
                    ] !== "function"
                ) {
                    throw new KindError(
                        "No render callback was registered.",
                        Errors.Internal,
                    );
                }

                /**
                 * And now we run the registered callback inside the VM.
                 */
                const result: RenderResult = await this._runScript(
                    vmContext,
                    `
const cb = window["${registrationCallbackName}"]["${registeredCbName}"];
cb();`,
                );

                /**
                 * Let's make sure that the rendered function returned something
                 * resembling a render result.
                 */
                if (
                    result == null ||
                    !Object.prototype.hasOwnProperty.call(result, "body") ||
                    !Object.prototype.hasOwnProperty.call(result, "status") ||
                    !Object.prototype.hasOwnProperty.call(result, "headers")
                ) {
                    throw new KindError(
                        `Malformed render result: ${JSON.stringify(result)}`,
                        Errors.Internal,
                    );
                }

                /**
                 * After all that, we should have a result, so let's return it and
                 * let our finally tidy up all the render context we built.
                 */
                return result;
            } finally {
                /**
                 * We need to make sure that whatever happens, we tidy everything
                 * up.
                 */
                await this._closeAll(closeables, renderAPI.logger);
            }
        };
}
