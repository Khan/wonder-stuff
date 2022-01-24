// NOTE(somewhatabstract): We don't use the return type, so we're just saying
// There is one.
declare class debugagent$Debuglet {}

declare type debugagent$Config = {
    logLevel?: number,
    allowExpressions?: boolean,
};

declare function debugagent$start(
    config?: debugagent$Config,
): debugagent$Debuglet;

declare module "@google-cloud/debug-agent" {
    declare export type Config = debugagent$Config;
    declare module.exports: {
        start: typeof debugagent$start,
    };
}
