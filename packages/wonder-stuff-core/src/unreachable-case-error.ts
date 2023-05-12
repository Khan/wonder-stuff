import {Errors} from "./errors";
import {KindError, Options} from "./kind-error";

/**
 * An thin wrapper around KindError which can be used to ensure exhaustiveness
 * of switch-case statements
 *
 * @param value The variable being refined by the switch-case statement.
 *
 * Example:
 * ```
 * import {UnreachableCaseError} from "@khanacademy/wonder-stuff-core";
 * type Action =
 *   | {type: "insert"; id: string; value: any}
 *   | {type: "delete"; id: string};
 *
 * function handleAction(action: Action) {
 *   switch (action.type) {
 *     case "insert": {
 *       // do insert
 *       break;
 *     }
 *     case "delete": {
 *       // do delete
 *     }
 *     default: {
 *       throw new UnreachableCaseError(action);
 *     }
 *   }
 * }
 * ```
 *
 * If a new action type is added to the `Action` type that isn't handled by
 * the switch-case statement, the `default` case will become reachable and
 * TypeScript will report an error.  This is becasue the first parameter of
 * `UnreachableCaseError`'s constructor is typed as `never` and nothing can
 * be assigned (or passed) to something typed as `never`.
 */
export class UnreachableCaseError extends KindError {
    constructor(
        value: never,
        kind: string = Errors.InvalidInput,
        options?: Options,
    ) {
        super(`Unhandled case for '${value}'`, kind, options);
    }
}
