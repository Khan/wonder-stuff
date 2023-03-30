import {isCacheable} from "../is-cacheable";

describe("#isCacheable", () => {
    describe("when override provided", () => {
        it("should call override", () => {
            // Arrange
            const overrideSpy = jest.fn();

            // Act
            isCacheable("URL", overrideSpy);

            // Assert
            expect(overrideSpy).toHaveBeenCalledWith("URL");
        });

        it.each([[true], [false]])(
            "should return result of override when === %s",
            (testPoint: any) => {
                // Arrange
                const overrideSpy = jest.fn().mockReturnValue(testPoint);

                // Act
                const result = isCacheable("URL", overrideSpy);

                // Assert
                expect(result).toBe(testPoint);
            },
        );
    });

    describe("when no override provided or override returns null", () => {
        it.each([[undefined], [() => null]])(
            "should return true for URLs ending in .js (overrideFn is %s)",
            (overrideFn: any) => {
                // Arrange
                /**
                 * Nothing
                 */

                // Act
                const result = isCacheable(
                    "/a/path/for/a/javascript/file.js",
                    overrideFn,
                );

                // Assert
                expect(result).toBeTrue();
            },
        );

        it.each([[undefined], [() => null]])(
            "should return true for URLs that are for .js but have query params (overrideFn is %s)",
            (overrideFn: any) => {
                // Arrange
                /**
                 * Nothing
                 */

                // Act
                const result = isCacheable(
                    "/a/path/for/a/javascript/file.js?test=test&this=that",
                    overrideFn,
                );

                // Assert
                expect(result).toBeTrue();
            },
        );

        it.each([
            ["/this/is/css.css", undefined],
            ["/this/has/.js/in_it", undefined],
            ["/", () => null],
            ["/some/thing/or/otherjs", () => null],
        ])(
            "should return false for URLs not ending in .js like %s",
            (url: any, overrideFn: any) => {
                // Arrange
                /**
                 * Nothing
                 */

                // Act
                const result = isCacheable(url, overrideFn);

                // Assert
                expect(result).toBeFalse();
            },
        );
    });
});
