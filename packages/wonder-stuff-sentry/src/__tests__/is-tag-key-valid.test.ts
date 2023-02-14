import {isTagKeyValid} from "../is-tag-key-valid";

describe("#isTagKeyValid", () => {
    it.each([undefined, "", Array(33).fill("a").join("")])(
        "should return false if a key is not valid (%s)",
        (testPoint: any) => {
            // Arrange

            // Act
            const result = isTagKeyValid(testPoint);

            // Assert
            // @ts-expect-error [FEI-5011] - TS2551 - Property 'toBeFalse' does not exist on type 'JestMatchers<boolean>'. Did you mean 'toBeFalsy'?
            expect(result).toBeFalse();
        },
    );

    it.each(["a", Array(32).fill("a").join("")])(
        "should return true if a key is valid (%s)",
        (testPoint: any) => {
            // Arrange

            // Act
            const result = isTagKeyValid(testPoint);

            // Assert
            // @ts-expect-error [FEI-5011] - TS2339 - Property 'toBeTrue' does not exist on type 'JestMatchers<boolean>'.
            expect(result).toBeTrue();
        },
    );
});
