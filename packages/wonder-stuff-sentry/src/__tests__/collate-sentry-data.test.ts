import "jest-extended";
import {KindError} from "@khanacademy/wonder-stuff-core";
import {KindSentryError} from "../kind-sentry-error";
import {collateSentryData} from "../collate-sentry-data";
import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options";
import * as NormalizeSentryData from "../normalize-sentry-data";

jest.mock("../normalize-sentry-data", () =>
    jest.requireActual("../normalize-sentry-data"),
);

describe("#collateSentryData", () => {
    describe("when root error is some other non-KindError", () => {
        it("should return the kind, group_by_message, and concatenated_message tags with empty context and fingerprint", () => {
            // Arrange
            const error = new Error("ROOT");

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result).toMatchInlineSnapshot(`
                {
                  "contexts": {},
                  "fingerprint": [],
                  "tags": {
                    "concatenated_message": "ROOT",
                    "group_by_message": "ROOT",
                    "kind": "Unknown",
                  },
                }
            `);
        });
    });

    describe("when root error is a KindError", () => {
        it("should combine tags of all errors and add kind, group_by_message, and concatenated_message tags", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    tags: {
                        causetag1: "CAUSE_TAG_1",
                    },
                },
            });
            const error = new KindError("ROOT", "RootKind", {
                cause: cause2,
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.tags).toMatchInlineSnapshot(`
                {
                  "causetag1": "CAUSE_TAG_1",
                  "concatenated_message": "ROOT",
                  "group_by_message": "ROOT",
                  "kind": "RootKind",
                }
            `);
        });

        it("should use the configured tag names", () => {
            // Arrange
            const cause = new Error("CAUSE");
            const error = new KindError("ERROR_MESSAGE", "ERROR_KIND", {
                cause,
            });
            const options = {
                ...DefaultKindErrorDataOptions,
                kindTagName: "KIND_TAG",
                groupByTagName: "GROUP_BY_TAG",
                concatenatedMessageTagName: "CONCATENATED_MESSAGE_TAG",
            } as const;

            // Act
            const result = collateSentryData(options, error);

            // Assert
            expect(result.tags).toEqual({
                KIND_TAG: "ERROR_KIND",
                GROUP_BY_TAG: "ERROR_MESSAGE",
                CONCATENATED_MESSAGE_TAG: "ERROR_MESSAGE",
            });
        });

        it("should include contexts capturing each causal error", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                    },
                },
            });
            const error = new KindError("ROOT", "RootKind", {
                cause: cause2,
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.contexts).toMatchObject({
                "Source Error - 1": {
                    error: cause2.toString(),
                    originalStack: expect.any(String),
                    sentryData: JSON.stringify(cause2.sentryData),
                },
                "Source Error - 2": {
                    error: cause1.toString(),
                    originalStack: expect.any(String),
                    sentryData: "",
                },
            });
        });

        it("should include contexts for each causal error using the configured context prefix", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                    },
                },
            });
            const error = new KindError("ROOT", "RootKind", {
                cause: cause2,
            });
            const options = {
                ...DefaultKindErrorDataOptions,
                causalErrorContextPrefix: "CAUSE",
            } as const;

            // Act
            const result = collateSentryData(options, error);

            // Assert
            expect(result.contexts).toMatchObject({
                CAUSE1: {
                    error: cause2.toString(),
                    originalStack: expect.any(String),
                    sentryData: JSON.stringify(cause2.sentryData),
                },
                CAUSE2: {
                    error: cause1.toString(),
                    originalStack: expect.any(String),
                    sentryData: "",
                },
            });
        });

        it("should collate contexts from all errors", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                        context2: {
                            context2value: "2",
                        },
                    },
                },
            });
            const error = new KindError("ROOT", "RootKind", {
                cause: cause2,
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.contexts).toMatchObject({
                context1: cause2.sentryData.contexts.context1,
                context2: cause2.sentryData.contexts.context2,
            });
        });

        it("should combine fingerprints from all errors", () => {
            // Arrange
            const cause1 = new KindSentryError("CAUSE1", "OtherKind", {
                sentryData: {
                    fingerprint: ["CAUSE1FINGERPRINT"],
                },
            });
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    fingerprint: ["CAUSE2FINGERPRINT"],
                },
            });
            const error = new KindError("ROOT", "RootKind", {
                cause: cause2,
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.fingerprint).toIncludeSameMembers([
                "CAUSE1FINGERPRINT",
                "CAUSE2FINGERPRINT",
            ]);
        });
    });

    describe("when root error is a KindSentryError", () => {
        it("should combine tags of all errors and add kind, group_by_message, and concatenated_message tags", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    tags: {
                        causetag1: "CAUSE_TAG_1",
                    },
                },
            });
            const error = new KindSentryError("ROOT", "RootKind", {
                cause: cause2,
                sentryData: {
                    tags: {
                        roottag1: "ROOT_TAG_1",
                    },
                },
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.tags).toMatchInlineSnapshot(`
                {
                  "causetag1": "CAUSE_TAG_1",
                  "concatenated_message": "ROOT caused by OtherKindSentryError: CAUSE2 caused by Error: CAUSE",
                  "group_by_message": "ROOT",
                  "kind": "RootKind",
                  "roottag1": "ROOT_TAG_1",
                }
            `);
        });

        it("should use the configured tag names", () => {
            // Arrange
            const {KindSentryError} = require("../kind-sentry-error");

            const cause = new Error("CAUSE");
            const error = new KindSentryError("ERROR_MESSAGE", "ERROR_KIND", {
                cause,
                sentryData: {
                    tags: {
                        x: "1",
                    },
                },
            });
            const options = {
                ...DefaultKindErrorDataOptions,
                kindTagName: "KIND_TAG",
                groupByTagName: "GROUP_BY_TAG",
                concatenatedMessageTagName: "CONCATENATED_MESSAGE_TAG",
            } as const;

            // Act
            const result = collateSentryData(options, error);

            // Assert
            expect(result.tags).toEqual({
                KIND_TAG: "ERROR_KIND",
                GROUP_BY_TAG: "ERROR_MESSAGE",
                CONCATENATED_MESSAGE_TAG:
                    "ERROR_MESSAGE caused by Error: CAUSE",
                x: "1",
            });
        });

        it("should include contexts capturing each causal error", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                    },
                },
            });
            const error = new KindSentryError("ROOT", "RootKind", {
                cause: cause2,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "override!",
                        },
                        context2: {
                            context2value: "2",
                        },
                    },
                },
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.contexts).toMatchObject({
                "Source Error - 1": {
                    error: cause2.toString(),
                    originalStack: expect.any(String),
                    sentryData: JSON.stringify(cause2.sentryData),
                },
                "Source Error - 2": {
                    error: cause1.toString(),
                    originalStack: expect.any(String),
                    sentryData: "",
                },
            });
        });

        it("should include contexts for each causal error using the configured context prefix", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                    },
                },
            });
            const error = new KindSentryError("ROOT", "RootKind", {
                cause: cause2,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "override!",
                        },
                        context2: {
                            context2value: "2",
                        },
                    },
                },
            });
            const options = {
                ...DefaultKindErrorDataOptions,
                causalErrorContextPrefix: "CAUSE",
            } as const;

            // Act
            const result = collateSentryData(options, error);

            // Assert
            expect(result.contexts).toMatchObject({
                CAUSE1: {
                    error: cause2.toString(),
                    originalStack: expect.any(String),
                    sentryData: JSON.stringify(cause2.sentryData),
                },
                CAUSE2: {
                    error: cause1.toString(),
                    originalStack: expect.any(String),
                    sentryData: "",
                },
            });
        });

        it("should collate contexts from all errors", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "1",
                        },
                        context2: {
                            context2value: "2",
                        },
                    },
                },
            });
            const error = new KindSentryError("ROOT", "RootKind", {
                cause: cause2,
                sentryData: {
                    contexts: {
                        context1: {
                            context1value: "override!",
                        },
                        context3: {
                            context3value: "2",
                        },
                    },
                },
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.contexts).toMatchObject({
                context1: error.sentryData.contexts.context1,
                context2: cause2.sentryData.contexts.context2,
                context3: error.sentryData.contexts.context3,
            });
        });

        it("should combine fingerprints from all errors", () => {
            // Arrange
            const cause1 = new Error("CAUSE");
            const cause2 = new KindSentryError("CAUSE2", "OtherKind", {
                cause: cause1,
                sentryData: {
                    fingerprint: ["CAUSE2FINGERPRINT"],
                },
            });
            const error = new KindSentryError("ROOT", "RootKind", {
                cause: cause2,
                sentryData: {
                    fingerprint: ["ROOTFINGERPRINT"],
                },
            });

            // Act
            const result = collateSentryData(
                DefaultKindErrorDataOptions,
                error,
            );

            // Assert
            expect(result.fingerprint).toIncludeSameMembers([
                "ROOTFINGERPRINT",
                "CAUSE2FINGERPRINT",
            ]);
        });
    });

    it("should not add group_by_tag tag if the value is empty", () => {
        // Arrange
        const error = new Error(
            `${/*Deliberately whitespace*/ "            "}`,
        );

        // Act
        const result = collateSentryData(DefaultKindErrorDataOptions, error);

        // Assert
        expect(result.tags.group_by_message).toBeUndefined();
    });

    it("should normalize the collated data", () => {
        // Arrange
        const error = new KindSentryError("ROOT", "RootKind", {
            sentryData: {
                tags: {
                    roottag1: "ROOT_TAG_1",
                },
            },
        });
        jest.spyOn(NormalizeSentryData, "normalizeSentryData").mockReturnValue({
            tags: {
                normalized: "normalized",
            },
            contexts: {
                normalized: {
                    normalized: "normalized",
                },
            },
            fingerprint: ["normalized"],
        });

        // Act
        const result = collateSentryData(DefaultKindErrorDataOptions, error);

        // Assert
        expect(result).toStrictEqual({
            tags: {
                normalized: "normalized",
                kind: "RootKind",
                group_by_message: "ROOT",
                concatenated_message: "ROOT",
            },
            contexts: {
                normalized: {
                    normalized: "normalized",
                },
            },
            fingerprint: ["normalized"],
        });
    });

    it("should throw if normalization fails", () => {
        // Arrange
        const error = new KindSentryError("ROOT", "RootKind", {
            sentryData: {
                tags: {
                    roottag1: "ROOT_TAG_1",
                },
            },
        });
        jest.spyOn(
            NormalizeSentryData,
            "normalizeSentryData",
        ).mockImplementation(() => {
            throw new Error("Oh noes!");
        });

        // Act
        const act = () => collateSentryData(DefaultKindErrorDataOptions, error);

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(`"Oh noes!"`);
    });
});
