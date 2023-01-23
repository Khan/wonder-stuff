import {verifyRealTimers} from "./internal/verify-real-timers";
import {unverifiedWait} from "./internal/unverified-wait";
import {assertJest} from "./internal/assert-jest";

assertJest();

type WaitOptions = {
 /**
  * The time in milliseconds to wait on each wait.
  * Defaults to 0. Any number less than 0 will be treated as 0.
  */
 delay?: number,
 /**
  * The number of times to wait.
  * Defaults to 1. Any number below 1 will be treated as 1.
  */
 count?: number
};

/**
 * Wait for the given delay as many times as indicated.
 *
 * This will throw if jest.useRealTimers() is not used.
 */
export const wait: (options?: WaitOptions) => Promise<void> = ({
    delay = 0,
    count = 1,
} = {}) => {
    verifyRealTimers();

    const normalizedDelay = delay < 0 ? 0 : delay;
    const normalizedCount = count < 1 ? 1 : count;
    return unverifiedWait(normalizedDelay, normalizedCount);
};

const FRAME_DURATION = 17;

/**
 * Wait for the given delay.
 *
 * This will throw if jest.useRealTimers() is not used.
 */
export const waitForAnimationFrame: () => Promise<void> = () =>
    wait({delay: FRAME_DURATION});
