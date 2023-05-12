/* eslint-disable @typescript-eslint/no-unused-vars */
import {UnreachableCaseError} from "../unreachable-case-error";

type Action =
    | {type: "delete"; id: string}
    | {type: "insert"; id: string; value: any}
    | {type: "update"; id: string; newValue: any};

function exhaustive(action: Action) {
    switch (action.type) {
        case "delete":
            break;
        case "insert":
            break;
        case "update":
            break;
        default: {
            throw new UnreachableCaseError(action);
        }
    }
}

function nonExhaustive(action: Action) {
    switch (action.type) {
        case "delete":
            break;
        case "insert":
            break;
        default: {
            // @ts-expect-error: "update" isn't being handled
            throw new UnreachableCaseError(action);
        }
    }
}
