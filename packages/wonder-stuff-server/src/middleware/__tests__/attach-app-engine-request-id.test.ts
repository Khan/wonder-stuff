import {attachAppEngineRequestID} from "../attach-app-engine-request-id";
import * as GetAppEngineRequestID from "../../get-app-engine-request-id";
import * as GetRequestLogger from "../../get-request-logger";

jest.mock("../../get-app-engine-request-id");

describe("#attachAppEngineRequestID", () => {
    it("should return middleware function", () => {
        // Arrange
        const pretendLogger = {} as any;

        // Act
        const result = attachAppEngineRequestID(pretendLogger);

        // Assert
        // @ts-expect-error [FEI-5011] - TS2339 - Property 'toBeFunction' does not exist on type 'JestMatchers<Middleware<TReq, TRes>>'.
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
                const pretendDefaultLogger = {} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                const getRequestLoggerSpy = jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                );

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(getRequestLoggerSpy).not.toHaveBeenCalled();
            });

            it("should not create child logger from logger", () => {
                // Arrange
                const pretendDefaultLogger = {child: jest.fn()} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendDefaultLogger.child).not.toHaveBeenCalled();
            });

            it("should invoke next", () => {
                // Arrange
                const pretendDefaultLogger = {} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);

                // Act
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
                const pretendDefaultLogger = {child: jest.fn()} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                const getRequestLoggerSpy = jest
                    .spyOn(GetRequestLogger, "getRequestLogger")
                    .mockReturnValue(pretendDefaultLogger);

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(getRequestLoggerSpy).toHaveBeenCalledWith(
                    pretendDefaultLogger,
                    pretendRequest,
                );
            });

            it("should create child logger from logger with requestID", () => {
                // Arrange
                const pretendDefaultLogger = {child: jest.fn()} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendDefaultLogger.child).toHaveBeenCalledWith({
                    requestID: "REQUEST_ID",
                });
            });

            it("should attach child logger to request.log", () => {
                // Arrange
                const pretendChildLogger = {} as any;
                const pretendDefaultLogger = {
                    child: () => pretendChildLogger,
                } as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(pretendRequest.log).toBe(pretendChildLogger);
            });

            it("should invoke next", () => {
                // Arrange
                const pretendDefaultLogger = {child: jest.fn()} as any;
                const pretendRequest = {} as any;
                const pretendResponse = {} as any;
                const mockNext = jest.fn();
                const middleware =
                    attachAppEngineRequestID(pretendDefaultLogger);
                jest.spyOn(
                    GetRequestLogger,
                    "getRequestLogger",
                ).mockReturnValue(pretendDefaultLogger);

                // Act
                middleware(pretendRequest, pretendResponse, mockNext);

                // Assert
                expect(mockNext).toHaveBeenCalledTimes(1);
            });
        });
    });
});
