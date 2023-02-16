describe("root-logger.js", () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe("#setRootLogger", () => {
        it("should throw if called more than once", () => {
            // Arrange
            const {setRootLogger} = require("../root-logger");
            setRootLogger({} as any);

            // Act
            const underTest = () => setRootLogger({} as any);

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Root logger already set. Can only be set once per gateway."`,
            );
        });
    });

    describe("#getRootLogger", () => {
        it("should return the value passed to setRootLogger", () => {
            // Arrange
            const fakeLogger: any = {};
            const {getRootLogger, setRootLogger} = require("../root-logger");
            setRootLogger(fakeLogger);

            // Act
            const result = getRootLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });
    });
});
