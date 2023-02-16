// @flow
import {clone} from "./clone";
import type {Metadata} from "./types";

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
    const clonedValue = clone(metadata);

    // We know that we have cloned the incoming data and so our clone is of
    // the correct type.
    // $FlowIgnore[incompatible-return]
    return Object.freeze(clonedValue);
};
