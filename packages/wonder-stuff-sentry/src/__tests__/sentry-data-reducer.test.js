// @flow
import {sentryDataReducer} from "../sentry-data-reducer.js";
import type {SentryData} from "../types.js";

describe("#sentryDataReducer", () => {
    it("should return the accumulater when current is null", () => {
        // Arrange
        const accumulator: SentryData = {
            tags: {},
            contexts: {},
            fingerprint: [],
        };

        // Act
        const result = sentryDataReducer(accumulator, null, 0, [null]);

        // Assert
        expect(result).toEqual(accumulator);
    });

    it("should return object matching accumulator if current is empty", () => {
        // Arrange
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
        const current = {
            tags: {},
            contexts: {},
            fingerprint: [],
        };

        // Act
        const result = sentryDataReducer(accumulator, current, 0, [current]);

        // Assert
        expect(result).toEqual(accumulator);
    });

    it("should return object matching current if accumulator is empty", () => {
        // Arrange
        const accumulator: SentryData = {
            tags: {},
            contexts: {},
            fingerprint: [],
        };
        const current = {
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

        // Act
        const result = sentryDataReducer(accumulator, current, 0, [current]);

        // Assert
        expect(result).toEqual(current);
    });

    it("should return combine and deduplicate fingerprint values between accumulator and current", () => {
        // Arrange
        const accumulator: SentryData = {
            tags: {},
            contexts: {},
            fingerprint: ["a", "c"],
        };
        const current = {
            tags: {},
            contexts: {},
            fingerprint: ["a", "b"],
        };

        // Act
        const result = sentryDataReducer(accumulator, current, 0, [current]);

        // Assert
        expect(result).toEqual({
            tags: {},
            contexts: {},
            fingerprint: ["a", "c", "b"],
        });
    });

    it("should return a combination of accumulator and current tags and contexts, with current winning collisions", () => {
        // Arrange
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
        const current = {
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

        // Act
        const result = sentryDataReducer(accumulator, current, 0, [current]);

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
        const current = {
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

        // Act
        const result = sentryDataReducer(accumulator, current, 0, [current]);

        // Assert
        expect(result).toEqual(current);
    });
});
