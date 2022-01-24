// @flow
export type CloudOptions = {
    +debugAgent?: boolean,
    +profiler?: boolean,
};

/**
 * Information about an App Engine service instance.
 */
export type AppEngineInfo = {
    /**
     * Usually the value of GAE_SERVICE, if set. Otherwise, "unknown".
     */
    +name: string,

    /**
     * Usually the value of GAE_VERSION, if set. Otherwise, "unknown".
     */
    +version: string,

    /**
     * Usually the value of GAE_INSTANCE, if set. Otherwise, "unknown".
     */
    +instance: string,

    /**
     * The process identifier.
     */
    +pid: number,
};
