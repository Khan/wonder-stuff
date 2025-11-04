import * as CollateSentryData from "../collate-sentry-data";
import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options";
import {EmptySentryData} from "../empty-sentry-data";
import {kindErrorDataIntegration} from "../kind-error-data-integration";

jest.mock("../collate-sentry-data");

const mockClient: any = 0;

describe("KindErrorData", () => {
    const NODE_ENV = process.env.NODE_ENV;
    afterEach(() => {
        if (NODE_ENV == null) {
            delete process.env.NODE_ENV;
        } else {
            process.env.NODE_ENV = NODE_ENV;
        }
    });

    const INVALID_TAG_NAME = Array(33).fill("a").join("");
    describe("#constructor", () => {
        describe("when not built for production", () => {
            it.each([
                {kindTagName: INVALID_TAG_NAME},
                {groupByTagName: INVALID_TAG_NAME},
                {concatenatedMessageTagName: INVALID_TAG_NAME},
                {
                    kindTagName: `${INVALID_TAG_NAME}-kind`,
                    groupByTagName: `${INVALID_TAG_NAME}-group-by`,
                    concatenatedMessageTagName: `${INVALID_TAG_NAME}-concatenated-message`,
                },
            ])(
                "should throw if options are invalid (%s)",
                (badOptions: any) => {
                    // Arrange

                    // Act
                    const act = () => kindErrorDataIntegration(badOptions);

                    // Assert
                    expect(act).toThrowErrorMatchingSnapshot();
                },
            );
        });

        describe("when built for production", () => {
            beforeEach(() => {
                process.env.NODE_ENV = "production";
            });

            it.each([
                {kindTagName: INVALID_TAG_NAME},
                {groupByTagName: INVALID_TAG_NAME},
                {concatenatedMessageTagName: INVALID_TAG_NAME},
                {
                    kindTagName: `${INVALID_TAG_NAME}-kind`,
                    groupByTagName: `${INVALID_TAG_NAME}-group-by`,
                    concatenatedMessageTagName: `${INVALID_TAG_NAME}-concatenated-message`,
                },
            ])(
                "should not throw if options are invalid (%s)",
                (badOptions: any) => {
                    // Arrange

                    // Act
                    const act = () => kindErrorDataIntegration(badOptions);

                    // Assert
                    expect(act).not.toThrow("Invalid options");
                },
            );
        });

        it("should include information when throwing about invalid options", async () => {
            // Arrange
            const badOptions = {
                kindTagName: `${INVALID_TAG_NAME}-kind`,
                groupByTagName: `${INVALID_TAG_NAME}-group-by`,
                concatenatedMessageTagName: `${INVALID_TAG_NAME}-concatenated-message`,
            } as const;

            // Act
            const act = new Promise((resolve: any, reject: any) => {
                try {
                    // Should not resolve!
                    resolve(kindErrorDataIntegration(badOptions));
                } catch (e: any) {
                    reject(e);
                }
            });

            // Assert
            await expect(act).rejects.toHaveProperty("sentryData", {
                tags: {},
                fingerprint: [],
                contexts: {
                    invalidTagNames: {
                        invalidKindTag: badOptions.kindTagName,
                        invalidGroupByTag: badOptions.groupByTagName,
                        invalidConcatenatedMessageTag:
                            badOptions.concatenatedMessageTagName,
                    },
                },
            });
        });
    });

    describe("#processEvent", () => {
        it.each([
            null,
            undefined,
            {
                kind: "not-an-error",
            },
        ])(
            "should return the event if the original exception (%s) is not an Error",
            (originalException: any) => {
                // Arrange
                const underTest = kindErrorDataIntegration();
                const event = {
                    kind: "event",
                    event_id: "event-id",
                } as const;
                const hint = {
                    event_id: "event-id",
                    originalException,
                } as const;

                // Act
                const result = underTest.processEvent?.(
                    event,
                    hint,
                    mockClient,
                );

                // Assert
                expect(result).toBe(event);
            },
        );

        it("should return the event if there is no hint", () => {
            // Arrange
            const underTest = kindErrorDataIntegration();
            const event = {
                kind: "event",
                event_id: "event-id",
            } as const;

            // Act
            const result = underTest.processEvent?.(event, {}, mockClient);

            // Assert
            expect(result).toBe(event);
        });

        it("should call collateSentryData with the original exception and constructed options", () => {
            // Arrange
            const options = {
                ...DefaultKindErrorDataOptions,
                groupByTagName: "GROUP",
                kindTagName: "KIND",
            } as const;
            const underTest = kindErrorDataIntegration(options);
            const event = {
                kind: "event",
                event_id: "event-id",
            } as const;
            const hint = {
                event_id: "event-id",
                originalException: new Error("original-exception"),
            } as const;
            const collateSentryDataSpy = jest
                .spyOn(CollateSentryData, "collateSentryData")
                .mockReturnValue(EmptySentryData);

            // Act
            underTest.processEvent?.(event, hint, mockClient);

            // Assert
            expect(collateSentryDataSpy).toHaveBeenCalledWith(
                options,
                hint.originalException,
            );
        });

        it("should combine the tags, contexts and fingerprints from collateSentryData with the event data given", () => {
            // Arrange
            const options = {
                ...DefaultKindErrorDataOptions,
                groupByTagName: "GROUP",
                kindTagName: "KIND",
            } as const;
            const underTest = kindErrorDataIntegration(options);
            const event = {
                kind: "event",
                event_id: "event-id",
                tags: {
                    tag1: "originalValue1",
                    tag2: "originalValue2",
                },
                contexts: {
                    context1: {
                        key1: "originalValue1",
                    },
                    context2: {
                        key2: "originalValue2",
                    },
                },
                fingerprint: ["originalFingerprint"],
            } as const;
            const hint = {
                event_id: "event-id",
                originalException: new Error("original-exception"),
            } as const;
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue({
                tags: {
                    tag1: "tag1-value",
                },
                contexts: {
                    context1: {
                        key1: "value1",
                    },
                },
                fingerprint: ["fingerprint1", "fingerprint2"],
            });

            // Act
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{ readonly kind: "event"; readonly event_id: "event-id"; readonly tags: { readonly tag1: "originalValue1"; readonly tag2: "originalValue2"; }; readonly contexts: { readonly context1: { readonly key1: "originalValue1"; }; readonly context2: { ...; }; }; readonly fingerprint: readonly [...]; }' is not assignable to parameter of type 'SentryEvent'.
            const result = underTest.processEvent?.(event, hint, mockClient);

            // Assert
            expect(result).toStrictEqual({
                ...event,
                tags: {
                    tag1: "tag1-value",
                    tag2: "originalValue2",
                },
                contexts: {
                    context1: {
                        key1: "value1",
                    },
                    context2: {
                        key2: "originalValue2",
                    },
                },
                fingerprint: [
                    "originalFingerprint",
                    "fingerprint1",
                    "fingerprint2",
                ],
            });
        });
    });
});
