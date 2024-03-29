import "jest-extended";
import * as IsCacheable from "../is-cacheable";
import * as MakeUnbufferedNoCacheRequest from "../make-unbuffered-no-cache-request";
import * as RequestsFromCache from "../requests-from-cache";
import {makeRequest} from "../make-request";

jest.mock("../is-cacheable");
jest.mock("../make-unbuffered-no-cache-request");
jest.mock("../requests-from-cache");

describe("#makeRequest", () => {
    it("should get an unbuffered, no cache request", () => {
        // Arrange
        const fakeLogger: any = "LOGGER";
        const fakeRequestOptions: any = "FAKE_OPTIONS";
        const makeUnbufferedNoCacheRequestSpy = jest
            .spyOn(MakeUnbufferedNoCacheRequest, "makeUnbufferedNoCacheRequest")
            .mockReturnValue({} as any);

        // Act
        makeRequest(fakeRequestOptions, fakeLogger, "URL");

        // Assert
        expect(makeUnbufferedNoCacheRequestSpy).toHaveBeenCalledWith(
            fakeRequestOptions,
            fakeLogger,
            "URL",
        );
    });

    describe("with cache plugin", () => {
        it("should call isCacheable", () => {
            // Arrange
            const fakeLogger: any = "LOGGER";
            const fakeIsCacheableOverride = "FAKE_ISCACHEABLE";
            const fakeRequestOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
                isCacheable: fakeIsCacheableOverride,
            };
            const isCacheableSpy = jest.spyOn(IsCacheable, "isCacheable");
            jest.spyOn(
                MakeUnbufferedNoCacheRequest,
                "makeUnbufferedNoCacheRequest",
            ).mockReturnValue({} as any);
            jest.spyOn(RequestsFromCache, "asUncachedRequest");

            // Act
            makeRequest(fakeRequestOptions, fakeLogger, "URL");

            // Assert
            expect(isCacheableSpy).toHaveBeenCalledWith(
                "URL",
                fakeIsCacheableOverride,
            );
        });

        describe("isCachable returns true", () => {
            it("should call asCachedRequest", () => {
                // Arrange
                const fakeRequest: any = {
                    name: "FAKE_REQUEST",
                } as const;
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_PLUGIN",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(true);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue(fakeRequest);
                const asCachedRequestSpy = jest.spyOn(
                    RequestsFromCache,
                    "asCachedRequest",
                );

                // Act
                makeRequest(fakeRequestOptions, fakeLogger, "URL");

                // Assert
                expect(asCachedRequestSpy).toHaveBeenCalledWith(
                    fakeRequestOptions,
                    fakeRequest,
                );
            });

            it("should return result of asCachedRequest", () => {
                // Arrange
                const fakeCachedRequest: any = "FAKE_CACHED_REQUEST";
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_CACHING_STRATEGY",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(true);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue({} as any);
                jest.spyOn(
                    RequestsFromCache,
                    "asCachedRequest",
                ).mockReturnValue(fakeCachedRequest);

                // Act
                const result = makeRequest(
                    fakeRequestOptions,
                    fakeLogger,
                    "URL",
                );

                // Assert
                expect(result).toBe(fakeCachedRequest);
            });

            it("should return abortable promise with an aborted property mapped to underlying request", () => {
                // Arrange
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_CACHING_STRATEGY",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(true);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue({
                    _aborted: true,
                } as any);
                jest.spyOn(
                    RequestsFromCache,
                    "asCachedRequest",
                ).mockImplementation((o: any, r: any) => r);

                // Act
                const result = makeRequest(
                    fakeRequestOptions,
                    fakeLogger,
                    "URL",
                );

                // Assert
                expect(result.aborted).toBeTrue();
            });
        });

        describe("isCachable returns false", () => {
            it("should call asUncachedRequest with request", () => {
                // Arrange
                const fakeRequest: any = {
                    name: "FAKE_REQUEST",
                } as const;
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_CACHING_STRATEGY",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(false);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue(fakeRequest);
                const asUncachedRequestSpy = jest.spyOn(
                    RequestsFromCache,
                    "asUncachedRequest",
                );

                // Act
                makeRequest(fakeRequestOptions, fakeLogger, "URL");

                // Assert
                expect(asUncachedRequestSpy).toHaveBeenCalledWith(fakeRequest);
            });

            it("should return result of asUncachedRequest", () => {
                // Arrange
                const fakeUncachedRequest: any = "FAKE_UNCACHED_REQUEST";
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_CACHING_STRATEGY",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(false);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue({} as any);
                jest.spyOn(
                    RequestsFromCache,
                    "asUncachedRequest",
                ).mockReturnValue(fakeUncachedRequest);

                // Act
                const result = makeRequest(
                    fakeRequestOptions,
                    fakeLogger,
                    "URL",
                );

                // Assert
                expect(result).toBe(fakeUncachedRequest);
            });

            it("should return abortable promise with an aborted property mapped to underlying request", () => {
                // Arrange
                const fakeLogger: any = "LOGGER";
                const fakeRequestOptions: any = {
                    cachePlugin: "FAKE_CACHING_STRATEGY",
                };
                jest.spyOn(IsCacheable, "isCacheable").mockReturnValue(false);
                jest.spyOn(
                    MakeUnbufferedNoCacheRequest,
                    "makeUnbufferedNoCacheRequest",
                ).mockReturnValue({
                    _aborted: true,
                } as any);
                jest.spyOn(
                    RequestsFromCache,
                    "asUncachedRequest",
                ).mockImplementation((r: any) => r);

                // Act
                const result = makeRequest(
                    fakeRequestOptions,
                    fakeLogger,
                    "URL",
                );

                // Assert
                expect(result.aborted).toBeTrue();
            });
        });
    });

    describe("with no cache plugin", () => {
        it("should call asUncachedRequest with request", () => {
            // Arrange
            const fakeRequest: any = {
                name: "FAKE_REQUEST",
            } as const;
            const fakeLogger: any = "LOGGER";
            const fakeRequestOptions: any = "FAKE_OPTIONS";
            jest.spyOn(
                MakeUnbufferedNoCacheRequest,
                "makeUnbufferedNoCacheRequest",
            ).mockReturnValue(fakeRequest);
            const asUncachedRequestSpy = jest.spyOn(
                RequestsFromCache,
                "asUncachedRequest",
            );

            // Act
            makeRequest(fakeRequestOptions, fakeLogger, "URL");

            // Assert
            expect(asUncachedRequestSpy).toHaveBeenCalledWith(fakeRequest);
        });

        it("should return result of asUncachedRequest", () => {
            // Arrange
            const fakeUncachedRequest: any = "FAKE UNCACHED REQUEST";
            const fakeLogger: any = "LOGGER";
            const fakeRequestOptions: any = "FAKE_OPTIONS";
            jest.spyOn(
                MakeUnbufferedNoCacheRequest,
                "makeUnbufferedNoCacheRequest",
            ).mockReturnValue({} as any);
            jest.spyOn(RequestsFromCache, "asUncachedRequest").mockReturnValue(
                fakeUncachedRequest,
            );

            // Act
            const result = makeRequest(fakeRequestOptions, fakeLogger, "URL");

            // Assert
            expect(result).toBe(fakeUncachedRequest);
        });
    });
});
