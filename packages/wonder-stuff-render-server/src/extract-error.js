// @flow
import type {AmbiguousError, SimplifiedError} from "./types";

/**
 * Extract the root cause error from an ambiguous error.
 *
 * This takes an ambiguous error representation and attempts to turn it into
 * a less ambiguous version.
 *
 * @param {AmbiguousError} error An object or string that represents an error.
 * @returns {SimplifiedError} A simplified error object.
 */
export function extractError(
    error: AmbiguousError,
): $ReadOnly<SimplifiedError> {
    // The error is a string, so we just use that.
    if (typeof error === "string") {
        return {error};
    }

    const addPropPrimitives = (
        targetObj: SimplifiedError,
        sourceError: AmbiguousError,
    ): $ReadOnly<SimplifiedError> => {
        const props: $NonMaybeType<SimplifiedError["props"]> = {};
        let addedProps = false;
        // This just gets any primitive (number/string/boolean/etc.) values off
        // the error that might be useful for diagnosing things and coerces them
        // to strings.
        for (const [key, value] of Object.entries(error)) {
            switch (key) {
                case "message":
                case "stack":
                case "name":
                    // This method will not pick up values behind getters which,
                    // for normal Error class objects, means this should skip
                    // things like message and stack, but let's filter them
                    // out just in case.
                    continue;

                default:
                    break;
            }
            switch (typeof value) {
                case "number":
                case "boolean":
                case "string":
                    addedProps = true;
                    props[key] = value;
                    break;

                default:
                    // More complex things are ignored. We're not looking
                    // to gather all the info.
                    break;
            }
        }
        if (addedProps) {
            // It's OK, we want everyone else to see this as not writable,
            // but know what we're doing.
            // $FlowIgnore[cannot-write]
            targetObj.props = props;
        }
        return Object.freeze(targetObj);
    };

    // The error has a response property. This is the style of superagent
    // failures which sometimes carry the response as a property.
    if (error.response && typeof error.response.error === "string") {
        const {
            response: {error: errorMessage},
        } = error;
        return addPropPrimitives(
            {
                error: errorMessage,
                stack: error.stack,
            },
            error,
        );
    }

    // The error references a child error, let's use that.
    if (error.error && error !== error.error) {
        return extractError((error.error: any));
    }

    // It seems it's a regular error.
    // `toString` should give us a nice error message. If not, we can try
    // error.message.
    const errorString = error.toString();
    return addPropPrimitives(
        {
            /**
             * If the toString just gave us the generic object response,
             * then try error.message, and if that doesn't work, try the error.name.
             * If that doesn't exist, fallback to a basic string.
             */
            error:
                errorString === "[object Object]"
                    ? error.message || error.name || "Unknown"
                    : errorString,
            stack: error.stack,
        },
        error,
    );
}
