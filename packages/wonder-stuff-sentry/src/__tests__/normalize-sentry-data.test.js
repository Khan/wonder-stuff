// @flow
import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options";
import {normalizeSentryData} from "../normalize-sentry-data";
import * as TruncateTagValue from "../truncate-tag-value";

jest.mock("../truncate-tag-value");

describe("#normalizeSentryData", () => {
    const NODE_ENV = process.env.NODE_ENV;
    afterEach(() => {
        if (NODE_ENV == null) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = NODE_ENV;
        }
    });

    describe("when not built for production", () => {
        it("should throw if there are invalid tag keys", () => {
            // Arrange
            const data = {
                tags: {
                    "": "value1",
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).toThrowErrorMatchingInlineSnapshot(
                `"Sentry data is not valid"`,
            );
        });

        it("should throw if there are reserved tag keys", () => {
            // Arrange
            const data = {
                tags: {
                    [DefaultKindErrorDataOptions.kindTagName]: "value1",
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).toThrowErrorMatchingInlineSnapshot(
                `"Sentry data is not valid"`,
            );
        });

        it("should throw if there are reserved context properties", () => {
            // Arrange
            const data = {
                contexts: {
                    contextOne: {
                        type: "value1",
                    },
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).toThrowErrorMatchingInlineSnapshot(
                `"Sentry data is not valid"`,
            );
        });
    });

    describe("when built for production", () => {
        beforeEach(() => {
            process.env.NODE_ENV = "production";
        });

        it("should not throw if there are invalid tag keys", () => {
            // Arrange
            const data = {
                tags: {
                    "": "value1",
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).not.toThrowError(`"Sentry data is not valid"`);
        });

        it("should not throw if there are reserved tag keys", () => {
            // Arrange
            const data = {
                tags: {
                    [DefaultKindErrorDataOptions.kindTagName]: "value1",
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).not.toThrowError(`"Sentry data is not valid"`);
        });

        it("should not throw if there are reserved context properties", () => {
            // Arrange
            const data = {
                contexts: {
                    contextOne: {
                        type: "value1",
                    },
                },
            };

            // Act
            const result = () =>
                normalizeSentryData(DefaultKindErrorDataOptions, data);

            // Assert
            expect(result).not.toThrowError(`"Sentry data is not valid"`);
        });
    });

    it("should include invalid tags, reserved tags, and reserved property usage information in thrown error sentry data", async () => {
        // Arrange
        const tooLong = Array(33).fill("a").join("");
        const data = {
            tags: {
                "": "value1",
                [tooLong]: "value1",
                [DefaultKindErrorDataOptions.kindTagName]: "value2",
                perfectlyFine: "value3",
            },
            contexts: {
                contextOne: {
                    type: "value4",
                },
                contextTwo: {
                    type: "value5",
                    notReserved: "value6",
                },
                contextThree: {
                    notReservedAtAll: "value7",
                },
            },
        };

        // Act
        const act = new Promise((resolve, reject) => {
            try {
                normalizeSentryData(DefaultKindErrorDataOptions, data);
                // Should never resolve!
                resolve();
            } catch (e) {
                reject(e);
            }
        });

        // Assert
        await expect(act).rejects.toHaveProperty("sentryData", {
            fingerprint: [],
            tags: {},
            contexts: {
                "Invalid Sentry Data": {
                    invalid_tag_keys: ["", tooLong],
                    reserved_tag_keys: [
                        DefaultKindErrorDataOptions.kindTagName,
                    ],
                    contexts_with_reserved_properties: {
                        contextOne: ["type"],
                        contextTwo: ["type"],
                    },
                },
            },
        });
    });

    it("should truncate tag values", () => {
        // Arrange
        jest.spyOn(TruncateTagValue, "truncateTagValue").mockReturnValue(
            "Truncated",
        );
        const data = {
            tags: {
                tag1: "Untruncated",
            },
        };

        // Act
        const {tags: result} = normalizeSentryData(
            DefaultKindErrorDataOptions,
            data,
        );

        // Assert
        expect(result).toStrictEqual({
            tag1: "Truncated",
        });
    });

    it("should return the validated sentry data", () => {
        // Arrange
        jest.spyOn(TruncateTagValue, "truncateTagValue").mockImplementation(
            (t) => t,
        );
        const data = {
            tags: {
                tag1: "tag1Value",
                tag2: "tag2Value",
            },
            contexts: {
                contextOne: {
                    iAm: "a context",
                },
                contextTwo: {
                    iAmAlso: "a context",
                },
            },
            fingerprint: ["fingerprint1", "fingerprint2"],
        };

        // Act
        const result = normalizeSentryData(DefaultKindErrorDataOptions, data);

        // Assert
        expect(result).toStrictEqual(data);
    });

    it.each([
        undefined,
        {},
        {tags: {a: "tag"}},
        {contexts: {aContext: {with: "a value"}}},
        {fingerprint: ["fingerprint1"]},
        {contexts: {aMissingContext: undefined}},
    ])(
        "should set defaults for data not included in the data given to be validated (%s)",
        (testPoint) => {
            // Arrange

            // Act
            const result = normalizeSentryData(
                DefaultKindErrorDataOptions,
                testPoint,
            );

            // Assert
            expect(result).toEqual({
                tags: expect.any(Object),
                contexts: expect.any(Object),
                fingerprint: expect.any(Array),
            });
        },
    );
});
