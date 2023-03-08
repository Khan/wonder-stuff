import type {SecretString} from "../types";

/**
 * Turn a string into a secret.
 */
export const secret = (value: string): SecretString => value as any;

String(secret("strifskd"));
