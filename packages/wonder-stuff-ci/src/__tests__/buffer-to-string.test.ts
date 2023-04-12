import {bufferToString} from "../buffer-to-string";

describe("#bufferToString", () => {
    it.each(["testing", Buffer.from("testing")])(
        "the buffer to string function returns the correct value",
        (testCase: string | Buffer) => {
            // Arrange
            const input = testCase;

            // Act
            const result = bufferToString(input);

            // Assert
            expect(result).toBe("testing");
        },
    );
});
