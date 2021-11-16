// @flow
import {safeStringify} from "@khanacademy/wonder-stuff-core";
import type {SentryContexts} from "./types.js";

export const stringifyNestedContexts = (
    contexts: SentryContexts,
): SentryContexts => {
    const stringifiedContexts = {};

    // For each context,
    for (const [key, value] of Object.entries(contexts)) {
        stringifiedContexts[key] = {};

        // For each top-level property of a context (each context is an object).
        // $FlowIgnore[incompatible-call]
        for (const [subKey, subValue] of Object.entries(value)) {
            if (typeof subValue === "object") {
                if (Array.isArray(subValue)) {
                    stringifiedContexts[key][subKey] = subValue.map((v) =>
                        typeof v === "object" ? safeStringify(v) : v,
                    );
                } else {
                    stringifiedContexts[key][subKey] = Object.entries(
                        // We know that subValue is an object.
                        // $FlowIgnore[incompatible-call]
                        subValue,
                    ).reduce((acc, [k, v]) => {
                        acc[k] = typeof v === "object" ? safeStringify(v) : v;
                        return acc;
                    }, {});
                }
            } else {
                stringifiedContexts[key] = value;
            }
        }
    }
    return stringifiedContexts;
};
