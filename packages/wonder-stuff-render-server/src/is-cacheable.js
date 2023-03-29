// @flow
export const isCacheable = (
    url: string,
    overrideFn: ?(string) => ?boolean,
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
