// @flow
import {getRequestLogger} from "../get-request-logger.js";

describe("#getRequestLogger", () => {
    it("should throw if both arguments are null/undefined", () => {
        // Arrange

        // Act
        const underTest = () => getRequestLogger();

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"No logs available"`,
        );
    });

    it("should throw if defaultLogger and request.log are null/undefined", () => {
        // Arrange

        // Act
        const underTest = () => getRequestLogger(null, ({}: $FlowFixMe));

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"No logs available"`,
        );
    });

    it("should return the default logger when there is no request", () => {
        // Arrange
        const pretendDefaultLogger = ({}: $FlowFixMe);

        // Act
        const result = getRequestLogger(pretendDefaultLogger);

        // Assert
        expect(result).toBe(pretendDefaultLogger);
    });

    it("should return the default logger when the request has no log", () => {
        // Arrange
        const pretendDefaultLogger = ({}: $FlowFixMe);

        // Act
        const result = getRequestLogger(pretendDefaultLogger, ({}: $FlowFixMe));

        // Assert
        expect(result).toBe(pretendDefaultLogger);
    });

    it.each([{}, null])(
        "should return the request logger when the request has a log",
        (defaultLogger) => {
            // Arrange
            const pretendRequestLogger = ({}: $FlowFixMe);
            const pretendRequest = ({
                log: pretendRequestLogger,
            }: $FlowFixMe);

            // Act
            const result = getRequestLogger(defaultLogger, pretendRequest);

            // Assert
            expect(result).toBe(pretendRequestLogger);
        },
    );
});
