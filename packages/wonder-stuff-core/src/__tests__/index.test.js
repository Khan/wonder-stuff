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

    it.each(["production", "development", "test"])(
        "should log hello world on import",
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
