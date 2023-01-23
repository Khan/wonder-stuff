import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import {assertJest} from "./assert-jest";

/**
 * Checks that jest is configured to use real timers.
 */
export const verifyRealTimers = () => {
    assertJest();

    // Jest may warn if calling timer methods when real timers are used.
    // We need to silence that, but without impacting folks testing, so we'll be
    // cheeky. We don't use this to detect the timers though because if they
    // change this behavior we would silently start just working.
    // eslint-disable-next-line no-console
    const oldWarn = console.warn;
    console.warn = () => {}; // eslint-disable-line no-console

    try {
        const timerCount = jest.getTimerCount();
        // eslint-disable-next-line no-restricted-syntax
        const timeoutID = setTimeout(() => {}, 0);
        const newTimerCount = jest.getTimerCount();
        // eslint-disable-next-line no-restricted-syntax
        clearTimeout(timeoutID);
        if (timerCount !== newTimerCount) {
            throw new KindError(
                "Cannot use wait() with fake timers. Call jest.useRealTimers() in test case or in a beforeEach.",
                Errors.InvalidUse,
            );
        }
    } finally {
        console.warn = oldWarn; // eslint-disable-line no-console
    }
};
