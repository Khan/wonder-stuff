// @flow
describe("index.js", () => {
    const NODE_ENV = process.env.NODE_ENV;
    afterEach(() => {
        if (NODE_ENV) {
            process.env.NODE_ENV = NODE_ENV;
        } else {
            delete process.env.NODE_ENV;
        }
    });

    it("should log hello production world on import when there is no NODE_ENV value", () => {
        // Arrange
        delete process.env.NODE_ENV;
        const spy = jest.spyOn(console, "log");

        // Act
        jest.isolateModules(() => {
            // eslint-disable-next-line import/no-unassigned-import
            require("../index.js");
        });

        // Assert
        expect(spy).toHaveBeenCalledWith(`Hello production World!`);
    });

    it("should log hello production world on import when there is no valid NODE_ENV value", () => {
        // Arrange
        process.env.NODE_ENV = "something I made up";
        const spy = jest.spyOn(console, "log");

        // Act
        jest.isolateModules(() => {
            // eslint-disable-next-line import/no-unassigned-import
            require("../index.js");
        });

        // Assert
        expect(spy).toHaveBeenCalledWith(`Hello production World!`);
    });

    it.each(["production", "development", "test"])(
        "should log hello %s world on import",
        (nodeEnv) => {
            // Arrange
            process.env.NODE_ENV = nodeEnv;
            const spy = jest.spyOn(console, "log");

            // Act
            jest.isolateModules(() => {
                // eslint-disable-next-line import/no-unassigned-import
                require("../index.js");
            });

            // Assert
            expect(spy).toHaveBeenCalledWith(`Hello ${nodeEnv} World!`);
        },
    );
});
