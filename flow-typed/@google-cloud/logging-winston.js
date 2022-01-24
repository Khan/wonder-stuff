// @flow
declare module "@google-cloud/logging-winston" {
    declare type loggingwinston$Callback = (
        err: Error,
        apiResponse: {...},
    ) => void;

    declare interface loggingwinston$Options {
        // TODO: Fill this out
    }
    declare class loggingwinston$LoggingWinston extends $winstonTransport {
        constructor(options?: loggingwinston$Options): this;
        log(info: any, callback: loggingwinston$Callback): void;
    }

    declare interface loggingwinston$express {
        makeMiddleware<
            Req: express$Request = express$Request,
            Res: express$Response = express$Response,
        >(
            logger: $winstonLogger<$winstonNpmLogLevels>,
            transport: loggingwinston$LoggingWinston,
        ): Promise<express$Middleware<Req, Res>>;
        makeMiddleware<
            Req: express$Request = express$Request,
            Res: express$Response = express$Response,
        >(
            logger: $winstonLogger<$winstonNpmLogLevels>,
            options?: loggingwinston$Options,
        ): Promise<express$Middleware<Req, Res>>;
    }

    declare module.exports: {
        LoggingWinston: typeof loggingwinston$LoggingWinston,
        express: loggingwinston$express,
    };
}
