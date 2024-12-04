const patchedMarker = "__patched__";

/**
 * JSDOM assumes that all fetchs are abortable. However, this is not always
 * the case, due to how some can be regular promises.
 *
 * Though we try to mitigate this in our various request implementations, this
 * is our last chance catch all that ensures the promise prototype has an abort
 * call.
 *
 * By making sure this exists, JSDOM does not throw when closing down an
 * instance and we can guarantee that all truly abortable requests are actually
 * aborted.
 */
export const applyAbortablePromisesPatch = (force = false): void => {
    if (
        !force &&
        // @ts-expect-error We know that this doesn't exist on the promise type
        // but it does if we already patched it.
        Promise.prototype.abort &&
        // @ts-expect-error We know that this doesn't exist on the promise type
        // but it does if we already patched it.
        Promise.prototype.abort[patchedMarker]
    ) {
        return;
    }

    // @ts-expect-error We know that this doesn't exist on the promise type
    // but it does if we already patched it.
    delete Promise.prototype.abort;

    /**
     * Make a noop and tag it as our patched version (that way we prevent
     * patching more than once).
     */
    const ourAbort = () => {
        /* empty */
    };
    ourAbort[patchedMarker] = true;

    // @ts-expect-error We know this isn't on the Promise type. We could
    // consider extending the type to add it at some point, but for now,
    // suppress.
    Promise.prototype.abort = ourAbort;
};
