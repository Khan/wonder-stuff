// @flow
import type {KindErrorDataOptions} from "./types.js";

/**
 * Default values for the `KindErrorDataOptions` type.
 */
export const DefaultKindErrorDataOptions: KindErrorDataOptions = {
    kindTagName: "kind",
    groupByTagName: "group_by_message",
    concatenatedMessageTagName: "concatenated_message",
    causalErrorContextPrefix: "Source Error - ",
    stringifyNestedContext: false,
};
