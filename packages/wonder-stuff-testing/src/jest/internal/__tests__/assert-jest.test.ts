import {assertJest} from "../assert-jest";
import * as IsRunningInJest from "../is-running-in-jest";

jest.mock("../is-running-in-jest");

describe("#assertJest", () => {
    it("should throw if we are not in jest", () => {
        // Arrange
        jest.spyOn(IsRunningInJest, "isRunningInJest").mockReturnValue(false);

        // Act
        const act = () => assertJest();

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(
            `"Invalid import - for use in tests only"`,
        );
    });

    it("should not throw if we are in jest", () => {
        // Arrange
        jest.spyOn(IsRunningInJest, "isRunningInJest").mockReturnValue(true);

        // Act
        const act = () => assertJest();

        // Assert
        expect(act).not.toThrow();
    });
});
