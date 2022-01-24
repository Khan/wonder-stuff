// @flow
describe("root-logger.js", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe("#setRootLogger", () => {
        it("should throw if called more than once", () => {
            // Arrange
            const {setRootLogger} = require("../root-logger.js");
            setRootLogger(({}: $FlowFixMe));

            // Act
            const underTest = () => setRootLogger(({}: $FlowFixMe));

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Root logger already set. Can only be set once per gateway."`,
            );
        });
    });

    describe("#getRootLogger", () => {
        it("should return the value passed to setRootLogger", () => {
            // Arrange
            const fakeLogger: $FlowFixMe = {};
            const {getRootLogger, setRootLogger} = require("../root-logger.js");
            setRootLogger(fakeLogger);

            // Act
            const result = getRootLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });
    });
});
