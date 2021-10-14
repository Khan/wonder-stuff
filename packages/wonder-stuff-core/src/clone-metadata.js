// @flow
import type {Metadata} from "./types.js";

const cloneValue = (value: any): any => {
    if (value && typeof value === "object") {
        if (Array.isArray(value)) {
            return value.map(cloneValue);
        } else {
            return Object.keys(value).reduce((acc, key) => {
                acc[key] = cloneValue(value[key]);
                return acc;
            }, {});
        }
    }
    return value;
};

/**
 * Clone the given metadata.
 *
 * This performs a deep clone of the given metadata and returns a read-only
 * clone.
 */
export const cloneMetadata = <T: Metadata>(
    metadata: ?$ReadOnly<T>,
): ?$ReadOnly<T> => {
    // If it's null or undefined, just return it as-is.
    if (metadata == null) {
        return metadata;
    }

    // Clone the data.
    const clone = cloneValue(metadata);

    // We know that we have cloned the incoming data and so our clone is of
    // the correct type.
    // $FlowIgnore[incompatible-return]
    return Object.freeze(clone);
};
