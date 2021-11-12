// @flow
import type {KindErrorDataOptions} from "./types.js";

export const DefaultKindErrorDataOptions: KindErrorDataOptions = {
    kindTagName: "kind",
    groupByTagName: "group_by_message",
    concatenatedMessageTagName: "concatenated_message",
    causalErrorContextPrefix: "Source Error - ",
};
