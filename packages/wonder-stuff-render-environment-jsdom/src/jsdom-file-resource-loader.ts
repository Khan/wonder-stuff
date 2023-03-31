import fs from "fs";
import path from "path";
import {promisify} from "util";
import {ResourceLoader} from "jsdom";
import type {FetchOptions, AbortablePromise} from "jsdom";
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import {applyAbortablePromisesPatch} from "./apply-abortable-promises-patch";

const readFileAsync = promisify(fs.readFile);

/**
 * A ResourceLoader implementation for JSDOM that loads files from disk.
 */
export class JSDOMFileResourceLoader extends ResourceLoader {
    _rootFolder: string;

    /**
     * Create instance of the resource loader.
     *
     * @param {string} rootFolder
     * The root of where we will load files.
     */
    constructor(rootFolder: string) {
        // Patch before super to make sure promises get an abort.
        applyAbortablePromisesPatch();

        super();

        if (!fs.existsSync(rootFolder)) {
            throw new KindError("Root folder cannot be found", Errors.NotFound);
        }

        this._rootFolder = rootFolder;
    }

    _makeFilePath: (arg1: string) => string = (url) => {
        /**
         * If the url is a url, we are going to use it as a file path from root.
         *
         * If it is an absolute path, we just use it, otherwise we treat it
         * as a relative path from root.
         */
        if (path.isAbsolute(url)) {
            return url;
        }

        try {
            const parsedURL = new URL(url);
            return path.normalize(
                path.join(this._rootFolder, parsedURL.pathname),
            );
        } catch (e: any) {
            /* nothing */
        }

        // Assume relative path
        return path.normalize(path.join(this._rootFolder, url));
    };

    fetch(url: string, options: FetchOptions): AbortablePromise<Buffer> | null {
        const filePath = this._makeFilePath(url);
        return readFileAsync(filePath) as AbortablePromise<Buffer>;
    }
}
