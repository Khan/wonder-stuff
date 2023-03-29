// @flow
import * as WSServer from "@khanacademy/wonder-stuff-server";

import {getSecrets} from "../get-secrets";
import * as ReadFile from "../read-file";

jest.mock("@khanacademy/wonder-stuff-server");

describe("#getSecrets", () => {
    it("should decrypt the secrets.json.enc file using the given crypto key path", async () => {
        // Arrange
        const encryptedSecrets = Buffer.from('"some-encrypted-secrets"');
        const decryptBufferWithKmsSpy = jest
            .spyOn(WSServer, "decryptBufferWithKms")
            .mockResolvedValue(Buffer.from('"some-decrypted-secrets"'));
        jest.spyOn(ReadFile, "readFile").mockResolvedValue(encryptedSecrets);

        // Act
        await getSecrets("some/cryptokey/path");

        // Assert
        expect(decryptBufferWithKmsSpy).toHaveBeenCalledWith(
            "some/cryptokey/path",
            encryptedSecrets,
        );
    });

    it("should return the decrypted secrets as JSON", async () => {
        // Arrange
        jest.spyOn(WSServer, "decryptBufferWithKms").mockResolvedValue(
            Buffer.from('"some-decrypted-secrets"'),
        );
        jest.spyOn(ReadFile, "readFile").mockResolvedValue(
            Buffer.from('"some-encrypted-secrets"'),
        );

        // Act
        const result = await getSecrets("some/cryptokey/path");

        // Assert
        expect(result).toEqual("some-decrypted-secrets");
    });
});
