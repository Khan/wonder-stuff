import {extractError} from "../extract-error";

describe("#extractError", () => {
    it("should return error and no stack if it is a string", () => {
        // Arrange
        const error = "THIS IS AN ERROR!";

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({error});
    });

    it.each([
        [
            "THIS IS A STACK!",
            {error: "THIS IS THE ERROR!", stack: "THIS IS A STACK!"},
        ],
        [undefined, {error: "THIS IS THE ERROR!", stack: undefined}],
    ])(
        "should return response error and stack if error has response property with error property",
        (stack: any, expectation: any) => {
            // Arrange
            const error = {
                response: {
                    error: "THIS IS THE ERROR!",
                },
                stack,
            } as const;

            // Act
            const result = extractError(error);

            // Assert
            expect(result).toStrictEqual(expectation);
        },
    );

    it("should recurse if error has error child", () => {
        // Arrange
        const error = {
            error: {
                error: {
                    error: "THIS IS THE ERROR!",
                },
            },
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({error: "THIS IS THE ERROR!"});
    });

    it("should have the result of toString if none of the other cases match", () => {
        // Arrange
        const error = {
            thisError: "IS NOT LIKE THE OTHERS",
            toString: () => "AND SO THIS IS THE ERROR!",
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "AND SO THIS IS THE ERROR!",
            stack: undefined,
            props: expect.any(Object),
        });
    });

    it("should fallback to error.message if [object Object] returned by toString", () => {
        // Arrange
        const error = {
            toString: () => "[object Object]",
            message: "THIS MESSAGE IS THE ERROR MESSAGE NOW",
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "THIS MESSAGE IS THE ERROR MESSAGE NOW",
            stack: undefined,
        });
    });

    it("should fallback to error.name if [object Object] returned by toString and no error.message", () => {
        // Arrange
        const error = {
            toString: () => "[object Object]",
            name: "THIS ERROR NAME IS THE ERROR MESSAGE NOW",
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "THIS ERROR NAME IS THE ERROR MESSAGE NOW",
            stack: undefined,
        });
    });

    it("should fallback to Unknown if [object Object] returned by toString and no error.message or error.name", () => {
        // Arrange
        const error = {
            toString: () => "[object Object]",
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "Unknown",
            stack: undefined,
        });
    });

    it("should not recurse if the error's error property is itself", () => {
        // Arrange
        let error: any;
        // eslint-disable-next-line prefer-const
        error = {
            error: {
                error,
                toString: () => "THIS IS THE ERROR!",
                stack: "THIS IS CYCLIC SO HERE'S A STACK",
            },
        };
        const actualError = {
            error,
        } as const;

        // Act
        const result = extractError(actualError);

        // Assert
        expect(result).toStrictEqual({
            error: "THIS IS THE ERROR!",
            stack: "THIS IS CYCLIC SO HERE'S A STACK",
        });
    });

    it("should attach props with the primitive fields of the error, not including stack, message, name", () => {
        // Arrange
        const error = {
            message: "A MESSAGE",
            stack: "A STACK",
            someValue: 5,
            someOtherValue: "I'M A VALUE",
            yetAnother: true,
            thisShouldNotGetIncluded: {
                because: "I'M AN OBJECT, not a primitive",
            },
            norThis: () => "I'M A FUNCTION, not a primitive",
        } as const;

        // Act
        const result = extractError(error);

        // Assert
        expect(result).toStrictEqual({
            error: "A MESSAGE",
            stack: "A STACK",
            props: {
                someValue: 5,
                someOtherValue: "I'M A VALUE",
                yetAnother: true,
            },
        });
    });
});
