// @flow
import {sentryDataReducer} from "../sentry-data-reducer.js";
import {EmptySentryData} from "../empty-sentry-data.js";
import {DefaultInitOptions} from "../default-init-options.js";
import * as Init from "../init.js";
import * as GetSentryDataFromError from "../get-sentry-data-from-error.js";
import type {SentryData} from "../types.js";

jest.mock("../init.js");

describe("#sentryDataReducer", () => {
    describe("index is zero", () => {
        it.each([null, EmptySentryData])(
            "should return the accumulator when error has no sentry data",
            (sentryData) => {
                // Arrange
                jest.spyOn(Init, "getOptions").mockReturnValue(
                    DefaultInitOptions,
                );
                const accumulator: SentryData = {
                    tags: {
                        tag1: "value1",
                    },
                    contexts: {
                        context1: {
                            value1: "value1value",
                        },
                    },
                    fingerprint: [],
                };
                const error = new Error("test");
                jest.spyOn(
                    GetSentryDataFromError,
                    "getSentryDataFromError",
                ).mockReturnValue(sentryData);

                // Act
                const result = sentryDataReducer(accumulator, error, 0);

                // Assert
                expect(result).toEqual(accumulator);
            },
        );

        it("should return object matching error's sentry data if accumulator is empty", () => {
            // Arrange
            jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
            const accumulator: SentryData = {...EmptySentryData};
            const error = new Error("test");
            const current: SentryData = {
                tags: {
                    tag1: "value1",
                },
                contexts: {
                    context1: {
                        value1: "value1value",
                    },
                },
                fingerprint: ["a"],
            };
            jest.spyOn(
                GetSentryDataFromError,
                "getSentryDataFromError",
            ).mockReturnValue(current);

            // Act
            const result = sentryDataReducer(accumulator, error, 0);

            // Assert
            expect(result).toEqual(current);
        });
    });

    describe("index is not zero", () => {
        it("should return the accumulator with additional context for the passed error when it has no sentry data", () => {
            // Arrange
            jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
            const accumulator: SentryData = {
                tags: {
                    tag1: "value1",
                },
                contexts: {
                    context1: {
                        value1: "value1value",
                    },
                },
                fingerprint: [],
            };
            const error = new Error("test");
            jest.spyOn(
                GetSentryDataFromError,
                "getSentryDataFromError",
            ).mockReturnValue(null);
            const expectedContextName = `${DefaultInitOptions.causalErrorContextPrefix}1`;

            // Act
            const result = sentryDataReducer(accumulator, error, 1);

            // Assert
            expect(result).toMatchObject(accumulator);
            expect(result.contexts).toHaveProperty(expectedContextName, {
                error: error.toString(),
                sentryData: "",
                originalStack: error.stack,
            });
        });

        it("should return the accumulator with additional context for the passed error including its sentry data", () => {
            // Arrange
            jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
            const accumulator: SentryData = {
                tags: {
                    tag1: "value1",
                },
                contexts: {
                    context1: {
                        value1: "value1value",
                    },
                },
                fingerprint: [],
            };
            const error = new Error("test");
            jest.spyOn(
                GetSentryDataFromError,
                "getSentryDataFromError",
            ).mockReturnValue(EmptySentryData);
            const expectedContextName = `${DefaultInitOptions.causalErrorContextPrefix}42`;

            // Act
            const result = sentryDataReducer(accumulator, error, 42);

            // Assert
            expect(result).toMatchObject(accumulator);
            expect(result.contexts).toHaveProperty(expectedContextName, {
                error: error.toString(),
                sentryData: '{"tags":{},"contexts":{},"fingerprint":[]}',
                originalStack: error.stack,
            });
        });

        it("should use the context name from initialization options", () => {
            // Arrange
            jest.spyOn(Init, "getOptions").mockReturnValue({
                ...DefaultInitOptions,
                causalErrorContextPrefix: "custom-context-name",
            });
            const accumulator: SentryData = {
                tags: {
                    tag1: "value1",
                },
                contexts: {
                    context1: {
                        value1: "value1value",
                    },
                },
                fingerprint: [],
            };
            const error = new Error("test");
            jest.spyOn(
                GetSentryDataFromError,
                "getSentryDataFromError",
            ).mockReturnValue(null);
            const expectedContextName = `custom-context-name42`;

            // Act
            const result = sentryDataReducer(accumulator, error, 42);

            // Assert
            expect(result).toMatchObject(accumulator);
            expect(result.contexts).toHaveProperty(expectedContextName, {
                error: error.toString(),
                sentryData: "",
                originalStack: error.stack,
            });
        });

        it("should return the error's data with additional context for the passed error", () => {
            // Arrange
            jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
            const accumulator: SentryData = {...EmptySentryData};
            const error = new Error("test");
            const current: SentryData = {
                tags: {
                    tag1: "value1",
                },
                contexts: {
                    context1: {
                        value1: "value1value",
                    },
                },
                fingerprint: ["a"],
            };
            jest.spyOn(
                GetSentryDataFromError,
                "getSentryDataFromError",
            ).mockReturnValue(current);
            const expectedContextName = `${DefaultInitOptions.causalErrorContextPrefix}12`;

            // Act
            const result = sentryDataReducer(accumulator, error, 12);

            // Assert
            expect(result).toMatchObject(current);
            expect(result.contexts).toHaveProperty(expectedContextName, {
                error: error.toString(),
                sentryData:
                    '{"tags":{"tag1":"value1"},"contexts":{"context1":{"value1":"value1value"}},"fingerprint":["a"]}',
                originalStack: error.stack,
            });
        });
    });

    it("should return combine and deduplicate fingerprint values between accumulator and current", () => {
        // Arrange
        jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
        const accumulator: SentryData = {
            tags: {},
            contexts: {},
            fingerprint: ["a", "c"],
        };
        const error = new Error("test");
        const current: SentryData = {
            tags: {},
            contexts: {},
            fingerprint: ["a", "b"],
        };
        jest.spyOn(
            GetSentryDataFromError,
            "getSentryDataFromError",
        ).mockReturnValue(current);

        // Act
        const result = sentryDataReducer(accumulator, error, 0);

        // Assert
        expect(result).toEqual({
            tags: {},
            contexts: {},
            fingerprint: ["a", "c", "b"],
        });
    });

    it("should return a combination of accumulator and current tags and contexts, with current winning collisions", () => {
        // Arrange
        jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
        const accumulator: SentryData = {
            tags: {
                tag1: "value1Accumulator",
                tag2: "value2Accumulator",
            },
            contexts: {
                context1: {
                    value1: "value1Accumulator",
                },
                context2: {
                    value2: "value2Accumulator",
                },
            },
            fingerprint: [],
        };
        const error = new Error("test");
        const current: SentryData = {
            tags: {
                tag1: "value1Current",
                tag3: "value3Current",
            },
            contexts: {
                context1: {
                    value1: "value1Current",
                },
                context3: {
                    value3: "value3Current",
                },
            },
            fingerprint: [],
        };
        jest.spyOn(
            GetSentryDataFromError,
            "getSentryDataFromError",
        ).mockReturnValue(current);

        // Act
        const result = sentryDataReducer(accumulator, error, 0);

        // Assert
        expect(result).toEqual({
            tags: {
                tag1: "value1Current",
                tag2: "value2Accumulator",
                tag3: "value3Current",
            },
            contexts: {
                context1: {
                    value1: "value1Current",
                },
                context2: {
                    value2: "value2Accumulator",
                },
                context3: {
                    value3: "value3Current",
                },
            },
            fingerprint: [],
        });
    });

    it("should return object matching current if all fields overwrite or duplicate accumulator fields", () => {
        // Arrange
        jest.spyOn(Init, "getOptions").mockReturnValue(DefaultInitOptions);
        const accumulator: SentryData = {
            tags: {
                tag1: "accValue",
            },
            contexts: {
                context1: {
                    value1: "accContextValue",
                },
            },
            fingerprint: ["a"],
        };
        const error = new Error("test");
        const current: SentryData = {
            tags: {
                tag1: "value1",
            },
            contexts: {
                context1: {
                    value1: "value1value",
                },
            },
            fingerprint: ["a"],
        };
        jest.spyOn(
            GetSentryDataFromError,
            "getSentryDataFromError",
        ).mockReturnValue(current);

        // Act
        const result = sentryDataReducer(accumulator, error, 0);

        // Assert
        expect(result).toEqual(current);
    });
});
