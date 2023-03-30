export const isCacheable = (
    url: string,
    overrideFn?: ((arg1: string) => boolean | null | undefined) | null,
): boolean => {
    const override = overrideFn?.(url);
    if (override != null) {
        return override;
    }

    /**
     * For now, let's just cache JS files.
     */
    const JSFileRegex = /^.*\.js(?:\?.*)?$/g;
    return JSFileRegex.test(url);
};
