/**
 * This is a simple local server for testing that logging works in a request
 * context.
 */

/**
 * NOTE: We import everything from index.js to ensure we're testing the public
 * interface of this package.
 */
import {runServer} from "../../src/index";
import type {RenderAPI, RenderResult} from "../../src/index";

async function main() {
    const renderEnvironment = {
        render: (url: string, renderAPI: RenderAPI): Promise<RenderResult> => {
            const traceSession = renderAPI.trace(
                "LOGGING",
                "Testing logging things",
            );
            try {
                renderAPI.logger.silly("A silly log", {with: "metadata"});
                renderAPI.logger.debug("A debug log", {with: "metadata"});
                renderAPI.logger.info("An info log", {with: "metadata"});
                renderAPI.logger.warn("A warning", {with: "metadata"});
                renderAPI.logger.error("An error", {with: "metadata"});

                return Promise.resolve({
                    body: `You asked us to render ${url}`,
                    status: 200,
                    headers: {},
                });
            } finally {
                traceSession.end({
                    with: "metadata",
                });
            }
        },
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
