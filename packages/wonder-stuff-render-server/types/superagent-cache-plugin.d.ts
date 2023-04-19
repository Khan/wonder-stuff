// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {SuperAgentRequest, Response} from "superagent";

declare module "superagent" {
    interface SuperAgentRequest {
        cacheWhenEmpty(cacheWhenEmpty: boolean): this;
        doQuery(doQuery: boolean): this;
        expiration(expiration?: number): this;
        forceUpdate(forceUpdate?: boolean): this;
        pruneQuery(pruneQuery: Array<string>): this;
        pruneHeader(pruneHeader: Array<string>): this;
        prune(
            prune: (
                response: Response,
                gutResponse: (response: Response) => any,
            ) => any,
        ): this;
        responseProp(responseProp: string): this;
    }
}
