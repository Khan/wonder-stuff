import {KindSentryError} from "../kind-sentry-error";
import {getSentryDataFromError} from "../get-sentry-data-from-error";

describe("#getSentryDataFromError", () => {
    it.each([null, undefined, new Error("test")])(
        "should return null for a non-KindSentryError value like %s",
        (error: any) => {
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
        } as const;
        const error = new KindSentryError("test", "CUSTOM_KIND", {
            // @ts-expect-error [FEI-5011] - TS2322 - Type '{ readonly tags: { readonly tag1: "tagValue1"; }; readonly contexts: { readonly context1: { readonly context1Key1: "context1Value1"; }; }; readonly fingerprint: readonly ["fingerprint1"]; }' is not assignable to type 'Partial<SentryData>'.
            sentryData,
        });

        // Act
        const result = getSentryDataFromError(error);

        // Assert
        expect(result).toStrictEqual(sentryData);
    });
});
