// @flow
const importInit = () =>
    new Promise((resolve) =>
        jest.isolateModules(() => {
            resolve(require("../init.js"));
        }),
    );

describe("#init", () => {
    it("should set the sentry API", async () => {
        // Arrange
        const {init, getSentry} = await importInit();
        const sentryAPI = {
            captureException: jest.fn(),
            withScope: jest.fn(),
        };

        // Act
        init(sentryAPI, {});
        const result = getSentry();

        // Assert
        expect(result).toBe(sentryAPI);
    });

    it("should set the options", async () => {
        // Arrange
        const {init, getOptions} = await importInit();
        const sentryAPI = {
            captureException: jest.fn(),
            withScope: jest.fn(),
        };
        const options = {
            kindTagName: "KIND",
            groupByTagName: "GROUPBY",
            concatenatedMessageTagName: "CONCATMESSAGE",
            causalErrorContextPrefix: "CAUSEPREFIX",
        };

        // Act
        init(sentryAPI, options);
        const result = getOptions();

        // Assert
        expect(result).toStrictEqual(options);
    });

    it("should throw if we are already initialized", async () => {
        // Arrange
        const {init} = await importInit();
        const sentryAPI = {
            captureException: jest.fn(),
            withScope: jest.fn(),
        };

        // Act
        init(sentryAPI, {});
        const act = () => init(sentryAPI, {});

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(
            `"Sentry API already registered"`,
        );
    });

    it("should throw if null is passed for the API", async () => {
        // Arrange
        const {init} = await importInit();

        // Act
        // $FlowIgnore[incompatible-call]
        const act = () => init(null, {});

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(
            `"Cannot register a null API"`,
        );
    });
});

describe("#isInitialized", () => {
    it("should return false if not initialized", async () => {
        // Arrange
        const {isInitialized} = await importInit();

        // Act
        const result = isInitialized();

        // Assert
        expect(result).toBeFalse();
    });

    it("should return true if not initialized", async () => {
        // Arrange
        const {isInitialized, init} = await importInit();
        const sentryAPI = {
            captureException: jest.fn(),
            withScope: jest.fn(),
        };

        // Act
        init(sentryAPI, {});
        const result = isInitialized();

        // Assert
        expect(result).toBeTrue();
    });
});

describe("#getOptions", () => {
    it("should throw if not initialized", async () => {
        // Arrange
        const {getOptions} = await importInit();

        // Act
        const act = () => getOptions();

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(
            `"Wonder Stuff Sentry not initialized"`,
        );
    });
});

describe("#getSentry", () => {
    it("should throw if not initialized", async () => {
        // Arrange
        const {getSentry} = await importInit();

        // Act
        const act = () => getSentry?.();

        // Assert
        expect(act).toThrowErrorMatchingInlineSnapshot(
            `"Wonder Stuff Sentry not initialized"`,
        );
    });
});
