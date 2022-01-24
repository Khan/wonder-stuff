// @flow
import * as RootLogger from "../root-logger.js";
import {getLogger} from "../get-logger.js";

/**
 * We have to mock like this, otherwise, we cannot setup spies.
 * This is because the object imported above is read-only and resists our
 * spy setting.
 */
jest.mock("../root-logger.js");

describe("get-logger.js", () => {
    describe("#getLogger", () => {
        it("should return the root logger when there is no request", async () => {
            // Arrange
            const fakeLogger = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);

            // Act
            const result = getLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the root logger when the request has no log", async () => {
            // Arrange
            const fakeLogger = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);

            // Act
            // $FlowIgnore[incompatible-call]
            const result = getLogger({});

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the request logger when the request has a log", async () => {
            // Arrange
            const fakeLogger = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);
            const pretendRequestLogger = {};
            const pretendRequest = {
                log: pretendRequestLogger,
            };

            // Act
            // $FlowIgnore[prop-missing]
            // $FlowIgnore[incompatible-call]
            const result = getLogger(pretendRequest);

            // Assert
            expect(result).toBe(pretendRequestLogger);
        });
    });
});
