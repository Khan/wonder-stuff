import {printNextSteps} from "../print-next-steps";

describe("printNextSteps", () => {
    it("should encode @ as %40 and / as %2F in the npm URL", () => {
        // Arrange
        const consoleSpy = jest
            .spyOn(console, "log")
            .mockImplementation(() => {});

        // Act
        printNextSteps("@khanacademy/my-pkg");

        // Assert
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining(
                "https://www.npmjs.com/package/%40khanacademy%2Fmy-pkg",
            ),
        );

        consoleSpy.mockRestore();
    });
});
