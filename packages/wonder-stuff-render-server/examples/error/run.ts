/**
 * This is a simple local server for testing what happens if rendering errors.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of this package.
 */
import {runServer} from "../../src/index";
import type {RenderAPI, RenderResult} from "../../src/index";

async function main() {
    const renderEnvironment = {
        render: (url: string, renderAPI: RenderAPI): Promise<RenderResult> =>
            Promise.reject(new Error(`OH NO! We couldn't render ${url}`)),
    };

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
