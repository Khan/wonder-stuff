import * as Kms from "@google-cloud/kms";
import {decryptBufferWithKms} from "../decrypt-buffer-with-kms";

jest.mock("@google-cloud/kms");

describe("#decryptBufferWithKms", () => {
    beforeEach(() => {});

    it("should create a kms client", async () => {
        // Arrange
        const kmsSpy = jest
            .spyOn(Kms, "KeyManagementServiceClient")
            .mockImplementation(
                () =>
                    ({
                        decrypt: jest.fn().mockReturnValue([
                            {
                                plaintext:
                                    Buffer.from("DECRYPTED").toString("base64"),
                            },
                        ]),
                    }) as any,
            );

        // Act
        await decryptBufferWithKms(
            "CRYPTO_KEY_PATH",
            Buffer.from("ciphertext"),
        );

        // Assert
        expect(kmsSpy).toHaveBeenCalledTimes(1);
    });

    it("should call decrypt with the base64 ciphertext and crypto key path", async () => {
        // Arrange
        const decryptSpy = jest.fn().mockReturnValue([
            {
                plaintext: Buffer.from("DECRYPTED").toString("base64"),
            },
        ]);
        jest.spyOn(Kms, "KeyManagementServiceClient").mockImplementation(
            () =>
                ({
                    decrypt: decryptSpy,
                }) as any,
        );

        // Act
        await decryptBufferWithKms(
            "CRYPTO_KEY_PATH",
            Buffer.from("ciphertext"),
        );

        // Assert
        expect(decryptSpy).toHaveBeenCalledWith({
            name: "CRYPTO_KEY_PATH",
            // "ciphertext" in base64
            ciphertext: "Y2lwaGVydGV4dA==",
        });
    });

    it("should return a buffer of the decrypted plaintext", async () => {
        // Arrange
        jest.spyOn(Kms, "KeyManagementServiceClient").mockImplementation(
            () =>
                ({
                    decrypt: jest.fn().mockReturnValue([
                        {
                            plaintext:
                                Buffer.from("DECRYPTED").toString("base64"),
                        },
                    ]),
                }) as any,
        );

        // Act
        const result = await decryptBufferWithKms(
            "CRYPTO_KEY_PATH",
            Buffer.from("ciphertext"),
        );

        // Assert
        expect(result).toBeInstanceOf(Buffer);
        expect(String(result)).toBe("DECRYPTED");
    });
});
