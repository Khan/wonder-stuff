/**
 * This is a simple JSDOM-based server.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of our package.
 */
import type vm from "vm";
import {runServer} from "@khanacademy/wonder-stuff-render-server";
import type {
    RenderAPI,
    ICloseable,
} from "@khanacademy/wonder-stuff-render-server";
import * as JSDOM from "../../src/index";

async function main() {
    const config = new JSDOM.Configuration(
        () => Promise.resolve(["http://localhost:8080/render.ts"]),
        (url: string, renderAPI: RenderAPI) =>
            new JSDOM.FileResourceLoader(__dirname),
        (
            url: string,
            fileURLs: ReadonlyArray<string>,
            renderAPI: RenderAPI,
            vmContext: vm.Context,
        ): Promise<ICloseable | null | undefined> => {
            vmContext._renderAPI = renderAPI;
            vmContext._API = {
                url,
                renderAPI,
                fileURLs,
            };
            return Promise.resolve(null);
        },
    );
    const renderEnvironment = new JSDOM.Environment(config);

    runServer({
        name: "DEV_LOCAL",
        port: 8080,
        host: "127.0.0.1",
        renderEnvironment,
    });
}

main().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`Error caught from main setup: ${err}`);
});
