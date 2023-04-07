import {buffer} from "stream/consumers";
import {execProm, bufferToString} from "../exec-prom";

describe("#bufferToString", () => {
    it.each(["testing", Buffer.from("testing")])(
        "the buffer to string function returns the correct value",
        (testCase: any) => {
            // Arrange
            const input = testCase;

            // Act
            const result = bufferToString(input);

            // Assert
            expect(result).toBe("testing");
        },
    );
});
