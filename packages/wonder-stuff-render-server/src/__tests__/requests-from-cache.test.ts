import {CACHE_ID_PROP_NAME, getResponseSource, asCachedRequest, asUncachedRequest} from "../requests-from-cache";

describe("#getResponseSource", () => {
    it("should return cache if the response CACHE_ID_PROP_NAME property does not match the given cacheID", () => {
        // Arrange
        const fakeResponse: any = {};
        fakeResponse[CACHE_ID_PROP_NAME] = "OLDER_CACHE_ID";

        // Act
        const result = getResponseSource(fakeResponse, "CACHE_ID");

        // Assert
        expect(result).toBe("cache");
    });

    it("should return new request if the response CACHE_ID_PROP_NAME property matches the given cacheID", () => {
        // Arrange
        const fakeResponse: any = {};
        fakeResponse[CACHE_ID_PROP_NAME] = "CACHE_ID";

        // Act
        const result = getResponseSource(fakeResponse, "CACHE_ID");

        // Assert
        expect(result).toBe("new request");
    });

    it("should return unknown if the request has no CACHE_ID_PROP_NAME property", () => {
        // Arrange
        const fakeResponse: any = {};

        // Act
        const result = getResponseSource(fakeResponse, "CACHE_ID");

        // Assert
        expect(result).toBe("unknown");
    });

    it("should return unknown if the passed CACHE_ID is nully", () => {
        // Arrange
        const fakeResponse: any = {};
        fakeResponse[CACHE_ID_PROP_NAME] = "CACHE_ID";

        // Act
        const result = getResponseSource(fakeResponse, null);

        // Assert
        expect(result).toBe("unknown");
    });
});

describe("#asUncachedRequest", () => {
    it("should buffer", () => {
        // Arrange
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asUncachedRequest(fakeRequest);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(true);
    });

    it("should resolve with the FROM_CACHE_PROP_NAME prop not set", async () => {
        // Arrange
        const fakeResponse: Record<string, any> = {};
        const fakeRequest: any = Promise.resolve(fakeResponse);
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const result = await asUncachedRequest(fakeRequest);

        // Assert
        expect(result).not.toHaveProperty(CACHE_ID_PROP_NAME);
    });

    it("should have an abort call that invokes the original superagent request with correct this context", () => {
        // Arrange
        const fakeResponse: Record<string, any> = {};
        const fakeRequest: any = Promise.resolve(fakeResponse);
        fakeRequest._abort = jest.fn();
        fakeRequest.abort = function (this: any) {
            this._abort();
        };
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const wrappedRequest = asUncachedRequest(fakeRequest);
        wrappedRequest.abort();

        // Assert
        expect(fakeRequest._abort).toHaveBeenCalled();
    });
});

describe("#asCachedRequest", () => {
    it("should throw if no cache plugin instance provided", () => {
        // Arrange
        const fakeOptions: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        const underTest = () => asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Cannot cache request without cache plugin instance."`,
        );
    });

    it("should use the superagent cache plugin instance from options", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_CACHE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.use).toHaveBeenCalledWith("FAKE_CACHE_PLUGIN");
    });

    it("should set the cache expiration to undefined if no getExpiration option", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
            getExpiration: null,
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith(undefined);
    });

    it("should get an expiration value based off the getExpiration option", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
            getExpiration: jest.fn(),
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeOptions.getExpiration).toHaveBeenCalledWith("THE URL");
    });

    it("should set the cache expiration based off the caching strategy value", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
            getExpiration: jest.fn().mockReturnValue("EXPIRATION VALUE"),
        };
        const fakeRequest: any = {
            url: "THE URL",
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.expiration).toHaveBeenCalledWith("EXPIRATION VALUE");
    });

    it("should add a custom prune function to the request caching", () => {
        // Arrange
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.prune).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should have an abort call that invokes the original superagent request with correct this context", () => {
        // Arrange
        /**
         * If the function works, the then will return this fake result
         * and then the abort function will be added to it that invokes the
         * abort of the original fakeRequest.
         */
        const fakeResult: any = {};
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnValue(fakeResult),
            _abort: jest.fn(),
            abort: function (this: any) {
                this._abort();
            },
        };
        const fakeOptions: any = {
            cachePlugin: "FAKE_PLUGIN",
        };
        fakeRequest.buffer = jest.fn().mockReturnThis();

        // Act
        const wrappedRequest = asCachedRequest(fakeOptions, fakeRequest);
        wrappedRequest.abort();

        // Assert
        expect(fakeRequest._abort).toHaveBeenCalled();
    });

    describe("prune operation", () => {
        it("should gut the response with the passed function", () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse = "FAKE_RESPONSE";
            const gutResponseFn = jest.fn().mockReturnValue({});
            asCachedRequest(fakeOptions, fakeRequest);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(gutResponseFn).toHaveBeenCalledWith(fakeResponse);
        });

        it("should not set the CACHE_ID_PROP_NAME if there is no getCacheID callback", () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
            };
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse: Record<string, any> = {};
            const gutResponseFn = jest.fn().mockReturnValue(fakeResponse);
            asCachedRequest(fakeOptions, fakeRequest);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(fakeResponse).not.toHaveProperty(CACHE_ID_PROP_NAME);
        });

        it("should set the CACHE_ID_PROP_NAME to the return value of getCacheID", () => {
            // Arrange
            const fakeOptions: any = {
                cachePlugin: "FAKE_PLUGIN",
                getCacheID: () => "CACHE_ID",
            };
            const fakeRequest: any = {
                buffer: jest.fn().mockReturnThis(),
                expiration: jest.fn().mockReturnThis(),
                prune: jest.fn().mockReturnThis(),
                use: jest.fn().mockReturnThis(),
                then: jest.fn().mockReturnThis(),
            };
            const fakeResponse: Record<string, any> = {};
            const gutResponseFn = jest.fn().mockReturnValue(fakeResponse);
            asCachedRequest(fakeOptions, fakeRequest);
            const pruneFn = fakeRequest.prune.mock.calls[0][0];

            // Act
            pruneFn(fakeResponse, gutResponseFn);

            // Assert
            expect(fakeResponse).toHaveProperty(CACHE_ID_PROP_NAME, "CACHE_ID");
        });
    });

    it("should buffer", () => {
        // Arrange
        const fakeOptions: any = {
            buffer: "FAKE_BUFFER",
            cachePlugin: "FAKE_PLUGIN",
        };
        const fakeRequest: any = {
            buffer: jest.fn().mockReturnThis(),
            expiration: jest.fn().mockReturnThis(),
            prune: jest.fn().mockReturnThis(),
            use: jest.fn().mockReturnThis(),
            then: jest.fn().mockReturnThis(),
        };

        // Act
        asCachedRequest(fakeOptions, fakeRequest);

        // Assert
        expect(fakeRequest.buffer).toHaveBeenCalledWith(true);
    });
});
