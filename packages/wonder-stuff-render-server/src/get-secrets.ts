import {decryptBufferWithKms} from "@khanacademy/wonder-stuff-server";
import type {Secrets} from "@khanacademy/wonder-stuff-core";
import {readFile} from "./read-file";

/**
 * Get the secrets table for the service.
 */
export const getSecrets = async (cryptoKeyPath: string): Promise<Secrets> => {
    const encryptedSecretsBuffer = await readFile("./secrets.json.enc");
    const decrypedSecretsBuffer = await decryptBufferWithKms(
        cryptoKeyPath,
        encryptedSecretsBuffer,
    );
    return JSON.parse(decrypedSecretsBuffer.toString());
};
