// @flow
import {KindSentryError} from "../kind-sentry-error.js";
import {getSentryDataFromError} from "../get-sentry-data-from-error.js";

describe("#getSentryDataFromError", () => {
    it.each([null, undefined, new Error("test")])(
        "should return null for a non-KindSentryError value like %s",
        (error) => {
            // Arrange

            // Act
            const result = getSentryDataFromError(error);

            // Assert
            expect(result).toBeNull();
        },
    );

    it("should return the kind of the given KindError", () => {
        // Arrange
        const sentryData = {
            tags: {
                tag1: "tagValue1",
            },
            contexts: {
                context1: {
                    context1Key1: "context1Value1",
                },
            },
            fingerprint: ["fingerprint1"],
        };
        const error = new KindSentryError("test", "CUSTOM_KIND", {
            sentryData,
        });

        // Act
        const result = getSentryDataFromError(error);

        // Assert
        expect(result).toStrictEqual(sentryData);
    });
});
