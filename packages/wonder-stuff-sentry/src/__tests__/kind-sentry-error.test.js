// @flow
import {Errors} from "@khanacademy/wonder-stuff-core";
import type {Metadata} from "@khanacademy/wonder-stuff-core";
import {KindSentryError} from "../kind-sentry-error";
import type {SentryData} from "../types";

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
});
