// @flow
import {KindError} from "./kind-error.js";
import {Errors} from "./errors.js";

export const Order = Object.freeze({
    ConsequenceFirst: "consequence-first",
    CauseFirst: "cause-first",
});

export type SequenceOrder = $Values<typeof Order>;

/**
 * Given an error, generates a sequence of `Error`s.
 *
 * If the given error is a `KindError`-derivitive, this function will return
 * a sequence starting with that error and then including any causal errors,
 * chaining through causal `KindError`s accordingly.
 *
 * If `reverse` is `true`, the generated sequence starts with the lowermost
 * causal error and ends with the given error.
 */
export function* errorsFromError(
    error: ?Error,
    order: SequenceOrder,
): Iterator<Error> {
    if (order !== Order.CauseFirst && order !== Order.ConsequenceFirst) {
        throw new KindError("Invalid sequence order", Errors.InvalidInput, {
            metadata: {
                order,
            },
        });
    }
    if (error == null) {
        return;
    }

    if (order === Order.ConsequenceFirst) {
        yield error;
    }
    if (error instanceof KindError) {
        yield* errorsFromError(error.cause, order);
    }
    if (order === Order.CauseFirst) {
        yield error;
    }
}
