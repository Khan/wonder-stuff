import kms from "@google-cloud/kms";

/**
 * Decrypt a buffer using a Google Cloud KMS key.
 *
 * @param {string} cryptoKeyPath The path of the KMS crypto key to use.
 * @param {Buffer} buffer The buffer to decrypt.
 * @returns {Promise<Buffer>} The decrypted buffer.
 */
export const decryptBufferWithKms = async (
    cryptoKeyPath: string,
    buffer: Buffer,
): Promise<Buffer> => {
    const client = new kms.KeyManagementServiceClient();
    const ciphertext = buffer.toString("base64");
    const [result] = await client.decrypt({name: cryptoKeyPath, ciphertext});
    return Buffer.from(result.plaintext as any, "base64");
};
