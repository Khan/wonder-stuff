import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "@khanacademy/wonder-stuff-server";
import type {ServerOptions} from "@khanacademy/wonder-stuff-server";
import {getSecrets} from "./get-secrets";
import type {AuthenticationOptions} from "./types";

/**
 * Get the request authentication options for the service.
 *
 * Given the authentication options, this will load the secrets file, decrypt
 * it, and return the values needed for request authentication in a format
 * compatible with wonder-stuff-server.
 *
 * @param {AuthenticationOptions} authentication The authentication options
 * for the service.
 * @returns {Promise<?ServerOptions["requestAuthentication"]>} The promise of
 * the request authentication values.
 */
export const getRequestAuthentication = async (
    authentication?: AuthenticationOptions,
): Promise<ServerOptions["requestAuthentication"]> => {
    if (authentication == null) {
        return Promise.resolve(undefined);
    }

    const {cryptoKeyPath, headerName, secretKey, deprecatedSecretKey} =
        authentication;
    const secrets = await getSecrets(cryptoKeyPath);
    const secret = secrets[secretKey];
    const deprecatedSecret =
        deprecatedSecretKey == null
            ? secret
            : secrets[deprecatedSecretKey] ?? secret;
    if (secret == null) {
        /**
         * We don't check if the deprecated secret is set or not. If it isn't
         * that's not a critical error.
         */
        throw new KindError("Unable to load secret", Errors.NotFound);
    }
    return {
        headerName,
        secret,
        deprecatedSecret,
    };
};
