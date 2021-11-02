// @flow
import * as Init from "../init.js";
import * as CollateSentryData from "../collate-sentry-data.js";
import {captureError} from "../capture-error.js";
import {EmptySentryData} from "../empty-sentry-data.js";

describe("#captureError", () => {
    it("should collate the sentry data for the error", () => {
        // Arrange
        jest.spyOn(Init, "getSentry").mockReturnValue({
            withScope: jest.fn(),
            captureException: jest.fn(),
        });
        const collateSentryDataSpy = jest
            .spyOn(CollateSentryData, "collateSentryData")
            .mockReturnValue(EmptySentryData);
        const error = new Error("test");

        // Act
        captureError(error);

        // Assert
        expect(collateSentryDataSpy).toHaveBeenCalledWith(error);
    });

    it("should create a sentry scope", () => {
        // Arrange
        const sentryAPI = {
            withScope: jest.fn(),
            captureException: jest.fn(),
        };
        jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);
        jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
            EmptySentryData,
        );
        const error = new Error("test");

        // Act
        captureError(error);

        // Assert
        expect(sentryAPI.withScope).toHaveBeenCalledWith(expect.any(Function));
    });

    describe("within the scope", () => {
        it("should set tags on the scope", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);

            const sentryData = {
                ...EmptySentryData,
                tags: {
                    tag1: "tag1",
                    tag2: "tag2",
                },
            };
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                sentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setTags).toHaveBeenCalledWith(sentryData.tags);
        });

        it("should not set tags if there are none", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                EmptySentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setTags).not.toHaveBeenCalled();
        });

        it("should set each context on the scope", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);

            const sentryData = {
                ...EmptySentryData,
                contexts: {
                    context1: {
                        context1key1: "context1value1",
                    },
                    context2: {
                        context2key1: "context2value1",
                        context2key2: "context2value2",
                    },
                    context3: {
                        context3key1: "context3value1",
                        context3key2: "context3value2",
                        context3key3: "context3value3",
                    },
                },
            };
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                sentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setContext).toHaveBeenCalledWith(
                "context1",
                sentryData.contexts.context1,
            );
            expect(scope.setContext).toHaveBeenCalledWith(
                "context2",
                sentryData.contexts.context2,
            );
            expect(scope.setContext).toHaveBeenCalledWith(
                "context3",
                sentryData.contexts.context3,
            );
        });

        it("should not set contexts if there are none", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                EmptySentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setContext).not.toHaveBeenCalled();
        });

        it("should set the fingerprint on the scope", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);

            const sentryData = {
                ...EmptySentryData,
                fingerprint: ["A", "B", "C"],
            };
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                sentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setFingerprint).toHaveBeenCalledWith(
                sentryData.fingerprint,
            );
        });

        it("should not set the fingerprint if there is none", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                EmptySentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(scope.setFingerprint).not.toHaveBeenCalled();
        });

        it("should capture the error", () => {
            // Arrange
            const sentryAPI = {
                withScope: jest.fn(),
                captureException: jest.fn(),
            };
            const scope = {
                setTags: jest.fn(),
                setContext: jest.fn(),
                setFingerprint: jest.fn(),
            };
            jest.spyOn(Init, "getSentry").mockReturnValue(sentryAPI);
            jest.spyOn(CollateSentryData, "collateSentryData").mockReturnValue(
                EmptySentryData,
            );
            const error = new Error("test");

            // Act
            captureError(error);
            const withScopeFn = sentryAPI.withScope.mock.calls[0][0];
            withScopeFn(scope);

            // Assert
            expect(sentryAPI.captureException).toHaveBeenCalledWith(error);
        });
    });
});
