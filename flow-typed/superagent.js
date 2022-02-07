// @flow
declare type superagent$CallbackHandler = (
    err: any,
    res: ?superagent$Response,
) => ?boolean;

declare type superagent$Serializer = (obj: any) => string;

declare type superagent$BrowserParser = (str: string) => any;

declare type superagent$NodeParser = (
    res: superagent$Response,
    callback: (err: Error | null, body: any) => void,
) => void;

declare type superagent$Parser =
    | superagent$BrowserParser
    | superagent$NodeParser;

declare type superagent$MultipartValueSingle =
    | Blob
    | Buffer
    | stream$Readable
    | string
    | boolean
    | number;

declare type superagent$MultipartValue =
    | superagent$MultipartValueSingle
    | superagent$MultipartValueSingle[];

declare interface superagent$SuperAgentRequest extends superagent$Request {
    agent<+SocketT = net$Socket>(
        agent?: http$Agent<SocketT>,
    ): superagent$SuperAgentRequest;
}

declare type cookiejar$CookieJar = $FlowFixMe;

declare interface superagent$SuperAgentStatic extends stream$Stream {
    (url: string): superagent$SuperAgentRequest;
    (method: string, url: string): superagent$SuperAgentRequest;

    agent(): superagent$SuperAgentStatic & superagent$Request;
    serialize: {[type: string]: superagent$Serializer};
    parse: {[type: string]: superagent$Parser};

    jar: cookiejar$CookieJar;
    attachCookies(req: superagent$SuperAgentRequest): void;
    checkout(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    connect(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    copy(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    del(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    delete(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    get(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    head(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    lock(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    merge(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    mkactivity(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    mkcol(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    move(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    notify(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    options(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    patch(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    post(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    propfind(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    proppatch(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    purge(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    put(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    report(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    saveCookies(res: superagent$Response): void;
    search(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    subscribe(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    trace(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    unlock(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
    unsubscribe(
        url: string,
        callback?: superagent$CallbackHandler,
    ): superagent$SuperAgentRequest;
}

declare interface superagent$HTTPError extends Error {
    status: number;
    text: string;
    method: string;
    path: string;
}

declare interface superagent$Response extends stream$Readable {
    accepted: boolean;
    badRequest: boolean;
    body: any;
    charset: string;
    clientError: boolean;
    error: false | superagent$HTTPError;
    files: any;
    forbidden: boolean;
    get(header: string): string;
    get(header: "Set-Cookie"): string[];
    header: any;
    info: boolean;
    links: {...};
    noContent: boolean;
    notAcceptable: boolean;
    notFound: boolean;
    ok: boolean;
    redirect: boolean;
    serverError: boolean;
    status: number;
    statusType: number;
    text: string;
    type: string;
    unauthorized: boolean;
    xhr: XMLHttpRequest;
    redirects: string[];
}

declare interface superagent$Request extends Promise<superagent$Response> {
    cookies: string;
    method: string;
    url: string;
    abort(): void;
    accept(type: string): superagent$Request;
    attach(
        field: string,
        file: superagent$MultipartValueSingle,
        options?: string | {filename?: string, contentType?: string},
    ): superagent$Request;
    auth(
        user: string,
        pass: string,
        options?: {type: "basic" | "auto"},
    ): superagent$Request;
    auth(token: string, options: {type: "bearer"}): superagent$Request;
    buffer(val?: boolean): superagent$Request;
    ca(cert: string | string[] | Buffer | Buffer[]): superagent$Request;
    cert(cert: string | string[] | Buffer | Buffer[]): superagent$Request;
    clearTimeout(): superagent$Request;
    disableTLSCerts(): superagent$Request;
    end(callback?: superagent$CallbackHandler): void;
    field(name: string, val: superagent$MultipartValue): superagent$Request;
    field(fields: {
        [fieldName: string]: superagent$MultipartValue,
    }): superagent$Request;
    get(field: string): string;
    key(cert: string | string[] | Buffer | Buffer[]): superagent$Request;
    ok(callback: (res: superagent$Response) => boolean): superagent$Request;
    on(name: "error", handler: (err: any) => void): superagent$Request;
    on(
        name: "progress",
        handler: (event: superagent$ProgressEvent) => void,
    ): superagent$Request;
    on(
        name: "response",
        handler: (response: superagent$Response) => void,
    ): superagent$Request;
    on(name: string, handler: (event: any) => void): superagent$Request;
    parse(parser: superagent$Parser): superagent$Request;
    part(): superagent$Request;
    pfx(
        cert:
            | string
            | string[]
            | Buffer
            | Buffer[]
            | {pfx: string | Buffer, passphrase: string},
    ): superagent$Request;
    pipe(stream: stream$Writable, options?: {...}): stream$Writable;
    query(val: {...} | string): superagent$Request;
    redirects(n: number): superagent$Request;
    responseType(type: string): superagent$Request;
    retry(
        count?: number,
        callback?: superagent$CallbackHandler,
    ): superagent$Request;
    send(data?: string | {...}): superagent$Request;
    serialize(serializer: superagent$Serializer): superagent$Request;
    set(field: {...}): superagent$Request;
    set(field: string, val: string): superagent$Request;
    set(field: "Cookie", val: string[]): superagent$Request;
    timeout(
        ms: number | {deadline?: number, response?: number},
    ): superagent$Request;
    trustLocalhost(enabled?: boolean): superagent$Request;
    type(val: string): superagent$Request;
    unset(field: string): superagent$Request;
    use(fn: superagent$Plugin): superagent$Request;
    withCredentials(): superagent$Request;
    write(data: string | Buffer, encoding?: string): superagent$Request;
    maxResponseSize(size: number): superagent$Request;

    /**
     * Added by superagent-cache-plugin
     */
    cacheWhenEmpty(cacheWhenEmpty: boolean): superagent$Response;
    doQuery(doQuery: boolean): superagent$Request;
    expiration(expiration: ?number): superagent$Request;
    forceUpdate(forceUpdate: ?boolean): superagent$Request;
    pruneQuery(pruneQuery: Array<string>): superagent$Request;
    pruneHeader(pruneHeader: Array<string>): superagent$Request;
    prune(
        prune: (
            response: superagent$Response,
            gutResponse: (superagent$Response) => any,
        ) => any,
    ): superagent$Request;
    responseProp(responseProp: string): superagent$Request;
}

declare type superagent$Plugin = (req: superagent$SuperAgentRequest) => void;

declare type superagent$ProgressEvent = {
    direction: "download" | "upload",
    loaded: number,
    percent?: number,
    total?: number,
};

declare module "superagent" {
    declare export type CallbackHandler = superagent$CallbackHandler;
    declare export type Serializer = superagent$Serializer;
    declare export type BrowserParser = superagent$BrowserParser;
    declare export type NodeParser = superagent$NodeParser;
    declare export type Parser = superagent$Parser;
    declare export type MultipartValueSingle = superagent$MultipartValueSingle;
    declare export type MultipartValue = superagent$MultipartValue;
    declare export type Response = superagent$Response;
    declare export type SuperAgentRequest = superagent$SuperAgentRequest;
    declare export type Request = superagent$Request;
    declare export type Plugin = superagent$Plugin;

    declare module.exports: superagent$SuperAgentStatic;
}
