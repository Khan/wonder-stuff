//@flow
import * as Server from "@khanacademy/wonder-stuff-server";
import {makeAppEngineRequestIDMiddleware} from "../make-app-engine-request-id-middleware";
import * as GetAppEngineRequestID from "../../get-app-engine-request-id";

jest.mock("../../get-app-engine-request-id");

describe("#makeAppEngineRequestIDMiddleware", () => {
    it("should return middleware function", () => {
        // Arrange
        const pretendLogger = ({}: $FlowFixMe);

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
                const pretendDefaultLogger = ({}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                const getRequestLoggerSpy = jest.spyOn(
                    Server,
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
                const pretendDefaultLogger = ({child: jest.fn()}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(Server, "getRequestLogger").mockReturnValue(
                    pretendDefaultLogger,
                );

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
                const pretendDefaultLogger = ({}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
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
                const pretendDefaultLogger = ({child: jest.fn()}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                const getRequestLoggerSpy = jest
                    .spyOn(Server, "getRequestLogger")
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
                const pretendDefaultLogger = ({child: jest.fn()}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(Server, "getRequestLogger").mockReturnValue(
                    pretendDefaultLogger,
                );

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
                const pretendChildLogger = ({}: $FlowFixMe);
                const pretendDefaultLogger = ({
                    child: () => pretendChildLogger,
                }: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(Server, "getRequestLogger").mockReturnValue(
                    pretendDefaultLogger,
                );

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
                const pretendDefaultLogger = ({child: jest.fn()}: $FlowFixMe);
                const pretendRequest = ({}: $FlowFixMe);
                const pretendResponse = ({}: $FlowFixMe);
                const mockNext = jest.fn();
                const middleware =
                    makeAppEngineRequestIDMiddleware(pretendDefaultLogger);
                jest.spyOn(Server, "getRequestLogger").mockReturnValue(
                    pretendDefaultLogger,
                );

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
