// @flow
import type {AppEngineInfo} from "./types.js";
import {getAppEngineInfo} from "./get-app-engine-info.js";

/**
 * Get the default log metadata for a Google Cloud app engine server.
 */
export const getDefaultLogMetadata = (): {
    instanceID: AppEngineInfo["instance"],
    processID: AppEngineInfo["pid"],
} => {
    const {instance, pid} = getAppEngineInfo();
    return {
        instanceID: instance,
        processID: pid,
    };
};
