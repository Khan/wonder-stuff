import {JSDOMConfiguration} from "./jsdom-configuration";
import {JSDOMEnvironment} from "./jsdom-environment";
import {JSDOMResourceLoader} from "./jsdom-resource-loader";
import {JSDOMFileResourceLoader} from "./jsdom-file-resource-loader";

export type {IJSDOMConfiguration} from "./types";

export const JSDOM = {
    Configuration: JSDOMConfiguration,
    Environment: JSDOMEnvironment,
    ResourceLoader: JSDOMResourceLoader,
    FileResourceLoader: JSDOMFileResourceLoader,
} as const;
