// @flow
import type {AppEngineInfo} from "./types";

/**
 * Get info about the running gateway.
 *
 * Encapsulates the retrieval of gateway information to abstract away things
 * like GAE env vars.
 *
 * @returns {AppEngineInfo} The information about the gateway.
 */
export const getAppEngineInfo = (): AppEngineInfo => ({
    name: process.env.GAE_SERVICE ?? "unknown",
    version: process.env.GAE_VERSION ?? "unknown",
    instance: process.env.GAE_INSTANCE ?? "unknown",
    pid: process.pid,
});
