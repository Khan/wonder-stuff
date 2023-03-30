import type {IGate, ITimerAPI} from "./types";

/**
 * Make a gate that can be open and closed.
 * Default open.
 */
const makeGate = (): IGate => {
    let gateOpen = true;
    return {
        open: () => {
            gateOpen = true;
        },
        close: () => {
            gateOpen = false;
        },
        get isOpen(): boolean {
            return gateOpen;
        },
    };
};

/**
 * Return a function that patches timeout functions with shared warning.
 *
 * This returns a call that, when used to patch setTimeout, setInterval, etc.
 * will only warn once if any of the patched functions invokes a callback
 * after the given gate is closed.
 */
const makeSingleWarningPatchFn = () => {
    let warned = false;
    return (obj: any, fnName: string, gate: IGate): void => {
        const old = obj[fnName];
        delete obj[fnName];
        obj[fnName] = (callback: () => void, ...args: Array<any>) => {
            const gatedCallback = () => {
                if (gate.isOpen) {
                    callback();
                    return;
                }
                if (!warned) {
                    warned = true;
                    /**
                     * This uses console because it runs in the VM, so it
                     * doesn't have direct access to our winston logging.
                     * Our virtual JSDOM console manages that.
                     */
                    // eslint-disable-next-line no-console
                    console.warn("Dangling timer(s) detected");
                }
            };
            return old(gatedCallback, ...args);
        };
    };
};

/**
 * Patch the timer API to protect against dangling timers.
 *
 * @returns {IGate} A gate API to control when timers should be allowed to run
 * (gate is open), or when we should prevent them running and report dangling
 * timers (gate is closed).
 */
export const patchAgainstDanglingTimers = (objToPatch: ITimerAPI): IGate => {
    /**
     * Make a gate so we can control how the timers are handled.
     * The gate is default open.
     */
    const gate = makeGate();

    /**
     * Get a patch function with single warning.
     * This ensures that each of the patched functions will only warn of
     * dangling timers if none of the others have warned already.
     * This keeps the log a little tidier and manageable.
     */
    const patchCallbackFnWithGate = makeSingleWarningPatchFn();

    /**
     * Patch the timer functions on window so that dangling timers don't kill
     * us when we close the window.
     */
    patchCallbackFnWithGate(objToPatch, "setTimeout", gate);
    patchCallbackFnWithGate(objToPatch, "setInterval", gate);
    patchCallbackFnWithGate(objToPatch, "requestAnimationFrame", gate);

    return gate;
};
