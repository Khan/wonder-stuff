// @flow
import type {InitOptions} from "./types.js";

export const DefaultInitOptions: InitOptions = {
    kindTagName: "kind",
    groupByTagName: "group_by_message",
    concatenatedMessageTagName: "concatenated_message",
    causalErrorContextPrefix: "Source Error - ",
};
