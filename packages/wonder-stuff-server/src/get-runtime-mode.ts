// TODO(somewhatabstract, FEI-4174): Update eslint-plugin-import when they
// have fixed:
// https://github.com/import-js/eslint-plugin-import/issues/2073
// eslint-disable-next-line import/named
import {Runtime} from "./types";

/**
 * Determine the node runtime mode.
 *
 * The mode is calculated from NODE_ENV. If NODE_ENV is not set or set to
 * something other than expected values, the defaultMode is returned.
 *
 * @returns {Runtime} The runtime mode of production, development, or test.
 */
export const getRuntimeMode = (defaultMode: typeof Runtime[keyof typeof Runtime]): typeof Runtime[keyof typeof Runtime] => {
    switch (process.env.NODE_ENV) {
        case "test":
            return Runtime.Test;

        case "production":
        case "prod":
            return Runtime.Production;

        case "development":
        case "dev":
            return Runtime.Development;

        default:
            return defaultMode;
    }
};
