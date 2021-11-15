// @flow
import * as CollateSentryData from "../collate-sentry-data.js";
import {DefaultKindErrorDataOptions} from "../default-kind-error-data-options.js";
import {EmptySentryData} from "../empty-sentry-data.js";
import {KindErrorData} from "../kind-error-data.js";

jest.mock("../collate-sentry-data.js");

describe("KindErrorData", () => {
    describe("#setupOnce", () => {
        it("should register a global event processor", () => {
            // Arrange
            const addGlobalEventProcessorMock = jest.fn();
            const underTest = new KindErrorData();

            // Act
            underTest.setupOnce(addGlobalEventProcessorMock, jest.fn());

            // Assert
            expect(addGlobalEventProcessorMock).toHaveBeenCalledWith(
                expect.any(Function),
            );
        });

        describe("registered event processor", () => {
            it("should return the event if the integration is not returned from the hub", () => {
                // Arrange
                const addGlobalEventProcessorMock = jest.fn();
                const getHub = () => ({
                    getIntegration: () => undefined,
                });
                const underTest = new KindErrorData();
                underTest.setupOnce(addGlobalEventProcessorMock, getHub);
                const registeredProcessor =
                    addGlobalEventProcessorMock.mock.calls[0][0];
                const event = {
                    kind: "event",
                    event_id: "event-id",
                };

                // Act
                const result = registeredProcessor(event);

                // Assert
                expect(result).toBe(event);
            });

            it("should call enhanceEventWithErrorData", () => {
                // Arrange
                const underTest = new KindErrorData();
                const addGlobalEventProcessorMock = jest.fn();
                const getHub = () => ({
                    // $FlowIgnore[incompatible-call]
                    getIntegration: jest.fn().mockReturnValue(underTest),
                });
                const enhanceSpy = jest
                    .spyOn(underTest, "enhanceEventWithErrorData")
                    .mockReturnValue("ENHANCED");
                underTest.setupOnce(addGlobalEventProcessorMock, getHub);
                const registeredProcessor =
                    addGlobalEventProcessorMock.mock.calls[0][0];
                const event = {
                    kind: "event",
                    event_id: "event-id",
                };
                const hint = {
                    event_id: "event-id",
                };

                // Act
                const result = registeredProcessor(event, hint);

                // Assert
                expect(enhanceSpy).toHaveBeenCalledWith(event, hint);
                expect(result).toBe("ENHANCED");
            });
        });
    });

    describe("#enhanceEventWithErrorData", () => {
        it.each([
            null,
            undefined,
            {
                kind: "not-an-error",
            },
        ])(
            "should return the event if the original exception (%s) is not an Error",
            (originalException) => {
                // Arrange
                const underTest = new KindErrorData();
                const event = {
                    kind: "event",
                    event_id: "event-id",
                };
                const hint = {
                    event_id: "event-id",
                    originalException,
                };

                // Act
                const result = underTest.enhanceEventWithErrorData(event, hint);

                // Assert
                expect(result).toBe(event);
            },
        );

        it("should call collateSentryData with the original exception and constructed options", () => {
            // Arrange
            const options = {
                ...DefaultKindErrorDataOptions,
                groupByTagName: "GROUP",
                kindTagName: "KIND",
            };
            const underTest = new KindErrorData(options);
            const event = {
                kind: "event",
                event_id: "event-id",
            };
            const hint = {
                event_id: "event-id",
                originalException: new Error("original-exception"),
            };
            const collateSentryDataSpy = jest
                .spyOn(CollateSentryData, "collateSentryData")
                .mockReturnValue(EmptySentryData);

            // Act
            underTest.enhanceEventWithErrorData(event, hint);

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
            };
            const underTest = new KindErrorData(options);
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
            };
            const hint = {
                event_id: "event-id",
                originalException: new Error("original-exception"),
            };
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
            const result = underTest.enhanceEventWithErrorData(event, hint);

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
