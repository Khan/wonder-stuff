//@flow
import * as GetRequestLogger from "../../get-request-logger.js";
import {makeAppEngineRequestIDMiddleware} from "../make-app-engine-request-id-middleware.js";
import * as GetAppEngineRequestID from "../../get-app-engine-request-id.js";

jest.mock("../../get-app-engine-request-id.js");

describe("#makeAppEngineRequestIDMiddleware", () => {
    it("should return middleware function", () => {
        // Arrange
        const pretendLogger = ({}: any);

        // Act
        const result = makeAppEngineRequestIDMiddleware(pretendLogger);

        // Assert
        expect(result).toBeFunction();
    });

    describe("returned middleware", () => {
        describe("getAppEngineRequestID returns null", () => {
            beforeEach(() => {
                jest.spyOn(
                    GetAppEngineRequestID,
                    "getAppEngineRequestID",
                ).mockReturnValue(null);
            });

            it("should not call getRequestLogger", () => {
                // Arrange
                const pretendDefaultLogger = ({}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                const getRequestLoggerSpy = jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                );

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(getRequestLoggerSpy).not.toHaveBeenCalled();
            });

            it("should not create child logger from logger", () => {
                // Arrange
                const pretendDefaultLogger = ({child: jest.fn()}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendDefaultLogger.child).not.toHaveBeenCalled();
            });

            it("should invoke next", () => {
                // Arrange
                const pretendDefaultLogger = ({}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(mockNext).toHaveBeenCalledTimes(1);
            });
        });

        describe("getAppEngineRequestID returns a requestID", () => {
            beforeEach(() => {
                jest.spyOn(
                    GetAppEngineRequestID,
                    "getAppEngineRequestID",
                ).mockReturnValue("REQUEST_ID");
            });

            it("should use default logger and request with getRequestLogger to get logger", () => {
                // Arrange
                const pretendDefaultLogger = ({child: jest.fn()}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                const getRequestLoggerSpy = jest
                    .spyOn(GetRequestLogger, "getRequestLogger")
                    .mockReturnValue(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(getRequestLoggerSpy).toHaveBeenCalledWith(
                    pretendDefaultLogger,
                    pretendRequest,
                );
            });

            it("should create child logger from logger with requestID", () => {
                // Arrange
                const pretendDefaultLogger = ({child: jest.fn()}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendDefaultLogger.child).toHaveBeenCalledWith({
                    requestID: "REQUEST_ID",
                });
            });

            it("should attach child logger to request.log", () => {
                // Arrange
                const pretendChildLogger = ({}: any);
                const pretendDefaultLogger = ({
                    child: () => pretendChildLogger,
                }: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendRequest.log).toBe(pretendChildLogger);
            });

            it("should invoke next", () => {
                // Arrange
                const pretendDefaultLogger = ({child: jest.fn()}: any);
                const pretendRequest = ({}: any);
                const pretendResponse = ({}: any);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                /**
                 * $FlowIgnore[incompatible-call] The return type of Middleware
                 * can be error or non-error middleware and this confuses flow.
                 */
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(mockNext).toHaveBeenCalledTimes(1);
            });
        });
    });
});
