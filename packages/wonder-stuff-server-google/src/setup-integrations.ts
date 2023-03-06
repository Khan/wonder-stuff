import {Runtime} from "@khanacademy/wonder-stuff-server";
import type {GoogleCloudIntegrations} from "./types";

/**
 * Setup Google Cloud integrations debug-agent and profiler.
 *
 * These integrations help debug production services.
 */
export const setupIntegrations = async (
    mode: (typeof Runtime)[keyof typeof Runtime],
    {profiler}: GoogleCloudIntegrations = {
        profiler: false,
    },
): Promise<void> => {
    if (mode !== Runtime.Production) {
        // We don't support these agents outside of production.
        return;
    }

    if (profiler ?? false) {
        const profiler = await import("@google-cloud/profiler");
        profiler.start();
    }
};
