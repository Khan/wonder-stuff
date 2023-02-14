import * as RootLogger from "../root-logger";
import {getLogger} from "../get-logger";

/**
 * We have to mock like this, otherwise, we cannot setup spies.
 * This is because the object imported above is read-only and resists our
 * spy setting.
 */
jest.mock("../root-logger");

describe("get-logger.js", () => {
    describe("#getLogger", () => {
        it("should return the root logger when there is no request", async () => {
            // Arrange
            const fakeLogger: Record<string, any> = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);

            // Act
            const result = getLogger();

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the root logger when the request has no log", async () => {
            // Arrange
            const fakeLogger: Record<string, any> = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);

            // Act
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{}' is not assignable to parameter of type 'RequestWithLog<Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>>'.
            const result = getLogger({});

            // Assert
            expect(result).toBe(fakeLogger);
        });

        it("should return the request logger when the request has a log", async () => {
            // Arrange
            const fakeLogger: Record<string, any> = {};
            jest.spyOn(RootLogger, "getRootLogger").mockReturnValue(fakeLogger);
            const pretendRequestLogger: Record<string, any> = {};
            const pretendRequest = {
                log: pretendRequestLogger,
            } as const;

            // Act
            // @ts-expect-error [FEI-5011] - TS2345 - Argument of type '{ readonly log: Record<string, any>; }' is not assignable to parameter of type 'RequestWithLog<Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>>'.
            const result = getLogger(pretendRequest);

            // Assert
            expect(result).toBe(pretendRequestLogger);
        });
    });
});
