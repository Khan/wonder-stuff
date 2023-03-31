import {VirtualConsole} from "jsdom";
import {Errors} from "@khanacademy/wonder-stuff-core";
import type {Logger} from "@khanacademy/wonder-stuff-server";
import {extractError} from "@khanacademy/wonder-stuff-render-server";
import type {ICloseable} from "@khanacademy/wonder-stuff-render-server";

export class CloseableVirtualConsole
    extends VirtualConsole
    implements ICloseable
{
    _closed: boolean;

    constructor(logger: Logger) {
        super();
        this._closed = false;

        this.on("jsdomError", (e: Error) => {
            if (this._closed) {
                // We are closed. No logging.
                return;
            }
            if (e.message.indexOf("Could not load img") >= 0) {
                // We know that images cannot load. We're deliberately blocking
                // them.
                return;
            }
            const simplifiedError = extractError(e);
            logger.error(`JSDOM jsdomError:${simplifiedError.error || ""}`, {
                ...simplifiedError,
                kind: Errors.Internal,
            });
        });

        /**
         * NOTE(somewhatabstract): We pass args array as the metadata parameter for
         * winston log. We don't worry about adding the error kind here; we mark
         * these as Errors.Internal automatically if they don't already include a
         * kind.
         */
        this.on(
            "error",
            (message, ...args) =>
                !this._closed && logger.error(`JSDOM error:${message}`, {args}),
        );

        /**
         * We log all other things as `silly`, since they are generally only useful
         * to us when we're developing/debugging issues locally, and not in
         * production. We could add some way to turn this on in production
         * temporarily (like a temporary "elevate log level" query param) if
         * we find that will be useful, but I haven't encountered an issue that
         * needed these in production yet; they're just noise.
         */
        const passthruLog = (method: "warn" | "info" | "log" | "debug") => {
            this.on(
                method,
                (message, ...args) =>
                    !this._closed &&
                    logger.silly(`JSDOM ${method}:${message}`, {args}),
            );
        };
        passthruLog("warn");
        passthruLog("info");
        passthruLog("log");
        passthruLog("debug");
    }

    close() {
        this._closed = true;
    }
}
