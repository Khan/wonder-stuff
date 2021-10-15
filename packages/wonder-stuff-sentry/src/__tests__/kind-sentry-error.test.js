// @flow
import {KindError, Errors} from "@khanacademy/wonder-stuff-core";
import type {Metadata} from "@khanacademy/wonder-stuff-core";
import {KindSentryError} from "../kind-sentry-error.js";
import type {SentryData} from "../types.js";
import * as SentryDataReducer from "../sentry-data-reducer.js";

describe("KindSentryError", () => {
    describe("#constructor", () => {
        it("should end name with default SentryError", () => {
            // Arrange

            // Act
            const {name: result} = new KindSentryError("MESSAGE", "KIND");

            // Assert
            expect(result).toEndWith("SentryError");
        });

        it("should end name with given ending", () => {
            // Arrange

            // Act
            const {name: result} = new KindSentryError("MESSAGE", "KIND", {
                name: "NAME",
            });

            // Assert
            expect(result).toEndWith("NAMEError");
        });

        it("should start name with specified prefix", () => {
            // Arrange

            // Act
            const {name: result} = new KindSentryError("MESSAGE", "KIND", {
                prefix: "PREFIX",
            });

            // Assert
            expect(result).toStartWith("PREFIX");
        });

        it("should include kind in its name", () => {
            // Arrange

            // Act
            const {name: result} = new KindSentryError("MESSAGE", "KIND");

            // Assert
            expect(result).toContain("KIND");
        });

        it("should set kind to value passed", () => {
            // Arrange

            // Act
            const {kind: result} = new KindSentryError("MESSAGE", "KIND");

            // Assert
            expect(result).toBe("KIND");
        });

        it("should default kind to Errors.Unknown", () => {
            // Arrange

            // Act
            const {kind: result} = new KindSentryError("MESSAGE");

            // Assert
            expect(result).toBe(Errors.Unknown);
        });

        it("should combine metadata and sentryData into metadata, defaulting sentryData fields not given", () => {
            // Arrange
            const metadata: Metadata = {
                some: "metadata",
            };
            const sentryData: $Partial<SentryData> = {
                tags: {
                    tag1: "tagvalue1",
                },
            };

            // Act
            const {metadata: result} = new KindSentryError("MESSAGE", "KIND", {
                metadata,
                sentryData,
                prefix: "PREFIX",
            });

            // Assert
            expect(result).toStrictEqual({
                other: {
                    some: "metadata",
                },
                sentry: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {},
                    fingerprint: [],
                },
            });
        });

        it("should combine all fields of sentryData as they are specified", () => {
            // Arrange
            const metadata: Metadata = {
                some: "metadata",
            };
            const sentryData: $Partial<SentryData> = {
                tags: {
                    tag1: "tagvalue1",
                },
                contexts: {
                    some: {
                        contextual: "stuff",
                    },
                },
                fingerprint: ["finger", "print"],
            };

            // Act
            const {metadata: result} = new KindSentryError("MESSAGE", "KIND", {
                metadata,
                sentryData,
                prefix: "PREFIX",
            });

            // Assert
            expect(result).toStrictEqual({
                other: {
                    some: "metadata",
                },
                sentry: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {
                        some: {
                            contextual: "stuff",
                        },
                    },
                    fingerprint: ["finger", "print"],
                },
            });
        });
    });

    describe("@sentryData", () => {
        it("should return a valid empty SentryData when nothing was passed to constructor", () => {
            // Arrange
            const error = new KindSentryError("MESSAGE", "KIND");

            // Act
            const result = error.sentryData;

            // Assert
            expect(result).toStrictEqual({
                tags: {},
                contexts: {},
                fingerprint: [],
            });
        });

        it("should return the SentryData set by the constructor", () => {
            // Arrange
            const error = new KindSentryError("MESSAGE", "KIND", {
                sentryData: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {
                        some: {
                            contextual: "stuff",
                        },
                    },
                    fingerprint: ["finger", "print"],
                },
            });

            // Act
            const result = error.sentryData;

            // Assert
            expect(result).toStrictEqual({
                tags: {
                    tag1: "tagvalue1",
                },
                contexts: {
                    some: {
                        contextual: "stuff",
                    },
                },
                fingerprint: ["finger", "print"],
            });
        });
    });

    describe("#getAllSentryData", () => {
        it("should return the sentry data of the instance if there is no cause", () => {
            // Arrange
            const error = new KindSentryError("MESSAGE", "KIND", {
                sentryData: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                },
            });

            // Act
            const result = error.getAllSentryData();

            // Assert
            expect(result).toIncludeAllMembers([
                {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {},
                    fingerprint: [],
                },
            ]);
        });

        it("should return the sentry data of the instance if there are no KindSentryErrors nested in the cause", () => {
            // Arrange
            const cause = new Error(
                "I am not a KindError nor a KindSentryError",
            );
            const error = new KindSentryError("MESSAGE", "KIND", {
                cause,
                sentryData: {
                    fingerprint: ["a", "b", "c"],
                },
            });

            // Act
            const result = error.getAllSentryData();

            // Assert
            expect(result).toIncludeAllMembers([
                {
                    tags: {},
                    contexts: {},
                    fingerprint: ["a", "b", "c"],
                },
            ]);
        });

        it("should return a stack with SentryData from the error and all nested KindSentryErrors, skipping KindErrors", () => {
            // Arrange
            const cause3 = new KindSentryError("MESSAGE3", "KIND3", {
                sentryData: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                },
            });
            const cause2 = new KindSentryError("MESSAGE2", "KIND2", {
                cause: cause3,
                sentryData: {
                    fingerprint: ["a", "b", "c"],
                },
            });
            const cause1 = new KindError("MESSAGE1", "KIND1", {
                cause: cause2,
                metadata: {
                    sentry: "NOT REAL SENTRY DATA, SHOULD NOT BE IN RESULT",
                },
            });
            const error = new KindSentryError("MESSAGE", "KIND", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        topOfTheStack: {
                            hello: "I'm the root error",
                        },
                    },
                },
            });

            // Act
            const result = error.getAllSentryData();

            // Assert
            expect(result).toStrictEqual([
                {
                    tags: {},
                    contexts: {
                        topOfTheStack: {
                            hello: "I'm the root error",
                        },
                    },
                    fingerprint: [],
                },
                {
                    tags: {},
                    contexts: {},
                    fingerprint: ["a", "b", "c"],
                },
                {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {},
                    fingerprint: [],
                },
            ]);
        });
    });

    describe("#getMergedSentryData", () => {
        it("should reduce sentry data stack from bottom to top", () => {
            // Arrange
            const cause2 = new KindSentryError("MESSAGE3", "KIND3", {
                sentryData: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                },
            });
            const cause1 = new KindSentryError("MESSAGE2", "KIND2", {
                cause: cause2,
                sentryData: {
                    fingerprint: ["a", "b", "c"],
                },
            });
            const error = new KindSentryError("MESSAGE", "KIND", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        topOfTheStack: {
                            hello: "I'm the root error",
                        },
                    },
                },
            });
            const spy = jest.spyOn(SentryDataReducer, "sentryDataReducer");

            // Act
            error.getMergedSentryData();

            // Assert
            expect(spy).toHaveBeenCalledTimes(3);
            expect(spy).toHaveBeenNthCalledWith(
                1,
                {
                    tags: {},
                    contexts: {},
                    fingerprint: [],
                },
                {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {},
                    fingerprint: [],
                },
                2,
                expect.any(Array),
            );
            expect(spy).toHaveBeenLastCalledWith(
                {
                    tags: {
                        tag1: "tagvalue1",
                    },
                    contexts: {},
                    fingerprint: ["a", "b", "c"],
                },
                {
                    tags: {},
                    contexts: {
                        topOfTheStack: {
                            hello: "I'm the root error",
                        },
                    },
                    fingerprint: [],
                },
                0,
                expect.any(Array),
            );
        });

        it("should return the merged result", () => {
            // Arrange
            const cause2 = new KindSentryError("MESSAGE3", "KIND3", {
                sentryData: {
                    tags: {
                        tag1: "tagvalue1",
                    },
                },
            });
            const cause1 = new KindSentryError("MESSAGE2", "KIND2", {
                cause: cause2,
                sentryData: {
                    fingerprint: ["a", "b", "c"],
                },
            });
            const error = new KindSentryError("MESSAGE", "KIND", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        topOfTheStack: {
                            hello: "I'm the root error",
                        },
                    },
                },
            });

            // Act
            const result = error.getMergedSentryData();

            // Assert
            expect(result).toStrictEqual({
                tags: {
                    tag1: "tagvalue1",
                },
                fingerprint: ["a", "b", "c"],
                contexts: {
                    topOfTheStack: {
                        hello: "I'm the root error",
                    },
                },
            });
        });
    });
});
