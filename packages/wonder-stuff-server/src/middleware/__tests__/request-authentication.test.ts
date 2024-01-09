import {secret} from "@khanacademy/wonder-stuff-core";
import * as GetRuntimeMode from "../../get-runtime-mode";
import * as GetLogger from "../../get-logger";
import {requestAuthentication} from "../request-authentication";
import {Runtime} from "../../types";

describe("#requestAuthentication", () => {
    describe("when not in production", () => {
        beforeEach(() => {
            jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
                Runtime.Development,
            );
        });

        it("should create noop middleware", async () => {
            // Arrange
            const fakeAuthOptions = {
                headerName: "SECRET_HEADER",
            } as any;
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {
                secret_header: "SECRET_VALUE",
            };
            const fakeRequest: any = {
                header: (name: string) => headers[name.toLowerCase()],
                headers,
            };
            const fakeResponse: any = null;
            const fakeLogger: any = {
                debug: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            middleware(fakeRequest, fakeResponse, fakeNext);

            // Assert
            expect(fakeNext).toHaveBeenCalledTimes(1);
        });

        it("should log if no authentication options are provided", async () => {
            // Arrange
            const fakeAuthOptions = undefined;
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {};
            const fakeRequest: any = {
                header: (name: string) => headers[name.toLowerCase()],
                headers,
            };
            const fakeResponse: any = null;
            const fakeLogger: any = {
                debug: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            middleware(fakeRequest, fakeResponse, fakeNext);

            // Assert
            expect(fakeLogger.debug).toHaveBeenCalledTimes(1);
            expect(fakeLogger.debug.mock.calls[0][0]).toMatchInlineSnapshot(
                `"No authentication header configured."`,
            );
        });

        it("should log if authentication header is omitted from request", async () => {
            // Arrange
            const fakeAuthOptions: any = {
                headerName: "SECRET_HEADER",
            };
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {};
            const fakeRequest: any = {
                header: (name: string) => headers[name.toLowerCase()],
                headers,
            };
            const fakeResponse: any = null;
            const fakeLogger: any = {
                warn: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            middleware(fakeRequest, fakeResponse, fakeNext);

            // Assert
            expect(fakeLogger.warn).toHaveBeenCalledTimes(1);
            expect(fakeLogger.warn.mock.calls[0][0]).toMatchInlineSnapshot(
                `"Authentication header was not included in request."`,
            );
        });

        it("should log when authentication header is present but ignored", async () => {
            // Arrange
            const fakeAuthOptions: any = {
                headerName: "SECRET_HEADER",
            };
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {
                secret_header: "SECRET_VALUE",
            };
            const fakeRequest: any = {
                header: (name: string) => headers[name.toLowerCase()],
                headers,
            };
            const fakeResponse: any = null;
            const fakeLogger: any = {
                debug: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            middleware(fakeRequest, fakeResponse, fakeNext);

            // Assert
            expect(fakeLogger.debug).toHaveBeenCalledTimes(1);
            expect(fakeLogger.debug.mock.calls[0][0]).toMatchInlineSnapshot(
                `"Authentication header present but ignored in current runtime mode"`,
            );
        });

        it("should delete header when present", async () => {
            // Arrange
            const fakeAuthOptions: any = {
                headerName: "SECRET_HEADER",
            };
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {
                secret_header: "SECRET_VALUE",
            };
            const fakeRequest: any = {
                header: (name: string) => headers[name.toLowerCase()],
                headers,
            };
            const fakeLogger: any = {
                debug: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            middleware(fakeRequest, fakeRequest, fakeNext);

            // Assert
            expect(fakeRequest.headers).not.toHaveProperty("secret_header");
        });

        it("should throw if header deletion failed", async () => {
            // Arrange
            const fakeAuthOptions: any = {
                headerName: "SECRET_HEADER",
            };
            const fakeNext = jest.fn();
            const headers: Record<string, string> = {
                // incorrect case. Express headers are stored in lower case
                SECRET_HEADER: "SECRET_VALUE",
            };
            const fakeRequest: any = {
                header: (name: string) =>
                    /**
                     * We look up without using toLowerCase to mimic finding
                     * a header value both before and after deletion. This is
                     * to check that the right exception gets thrown when a
                     * deletion fails. This was added to catch if our code
                     * tries to delete a header using the wrong casing, which
                     * was a bug prior to this change.
                     */
                    headers[name],
                headers,
            };
            const fakeResponse: any = null;
            const fakeLogger: any = {
                debug: jest.fn(),
            };
            const middleware = await requestAuthentication(fakeAuthOptions);
            jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

            // Act
            const underTest = () =>
                middleware(fakeRequest, fakeResponse, fakeNext);

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Secret header could not be redacted!"`,
            );
        });
    });

    describe("when in production", () => {
        beforeEach(() => {
            jest.spyOn(GetRuntimeMode, "getRuntimeMode").mockReturnValue(
                Runtime.Production,
            );
        });

        describe("upon request with valid secret", () => {
            it("should continue", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeNext).toHaveBeenCalledTimes(1);
            });

            it("should delete the auth header", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeRequest.headers).not.toHaveProperty("header_name");
            });

            it("should throw if header deletion failed", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    HEADER_NAME: "SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) =>
                        /**
                         * We look up without using toLowerCase to mimic finding
                         * a header value both before and after deletion. This is
                         * to check that the right exception gets thrown when a
                         * deletion fails. This was added to catch if our code
                         * tries to delete a header using the wrong casing, which
                         * was a bug prior to this change.
                         */
                        headers[name],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                const underTest = () =>
                    middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Secret header could not be redacted!"`,
                );
            });
        });

        describe("upon request with valid deprecated secret", () => {
            it("should continue", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "DEPRECATED_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeNext).toHaveBeenCalledTimes(1);
            });

            it("should delete the auth header", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "DEPRECATED_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeRequest.headers).not.toHaveProperty("header_name");
            });

            it("should throw if header deletion failed", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    HEADER_NAME: "DEPRECATED_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) =>
                        /**
                         * We look up without using toLowerCase to mimic finding
                         * a header value both before and after deletion. This is
                         * to check that the right exception gets thrown when a
                         * deletion fails. This was added to catch if our code
                         * tries to delete a header using the wrong casing, which
                         * was a bug prior to this change.
                         */
                        headers[name],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                const underTest = () =>
                    middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Secret header could not be redacted!"`,
                );
            });
        });

        describe("upon request with invalid secret header value", () => {
            it("should respond with 401 (Not Authorized) status", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "WRONG_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn().mockReturnThis(),
                };
                const fakeNext: any = null;
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeResponse.status).toHaveBeenCalledWith(401);
            });

            it("should respond with error message", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "WRONG_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn().mockReturnThis(),
                };
                const fakeNext: any = null;
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeResponse.send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: expect.any(String),
                    }),
                );
                expect(
                    fakeResponse.send?.mock.calls[0][0].error,
                ).toMatchInlineSnapshot(`"Missing or invalid secret"`);
            });

            it("should delete the auth header", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    header_name: "WRONG_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn().mockReturnThis(),
                };
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeRequest.headers).not.toHaveProperty("header_name");
            });

            it("should throw if header deletion failed", async () => {
                // Arrange
                const headers: Record<string, string> = {
                    HEADER_NAME: "WRONG_SECRET_VALUE",
                };
                const fakeRequest: any = {
                    header: (name: string) =>
                        /**
                         * We look up without using toLowerCase to mimic finding
                         * a header value both before and after deletion. This is
                         * to check that the right exception gets thrown when a
                         * deletion fails. This was added to catch if our code
                         * tries to delete a header using the wrong casing, which
                         * was a bug prior to this change.
                         */
                        headers[name],
                    headers,
                };
                const fakeResponse: any = null;
                const fakeNext = jest.fn();
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                const underTest = () =>
                    middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Secret header could not be redacted!"`,
                );
            });
        });

        describe("upon request with missing secret header", () => {
            it("should respond with 401 (Not Authorized) status", async () => {
                // Arrange
                const headers: Record<string, string> = {};
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn().mockReturnThis(),
                };
                const fakeNext: any = null;
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeResponse.status).toHaveBeenCalledWith(401);
            });

            it("should respond with error message", async () => {
                // Arrange
                const headers: Record<string, string> = {};
                const fakeRequest: any = {
                    header: (name: string) => headers[name.toLowerCase()],
                    headers,
                };
                const fakeResponse: any = {
                    status: jest.fn().mockReturnThis(),
                    send: jest.fn().mockReturnThis(),
                };
                const fakeNext: any = null;
                const authenticationOptions = {
                    secret: secret("SECRET_VALUE"),
                    deprecatedSecret: secret("DEPRECATED_SECRET_VALUE"),
                    headerName: "HEADER_NAME",
                };
                const middleware = await requestAuthentication(
                    authenticationOptions,
                );

                // Act
                middleware(fakeRequest, fakeResponse, fakeNext);

                // Assert
                expect(fakeResponse.send).toHaveBeenCalledWith(
                    expect.objectContaining({
                        error: "Missing or invalid secret",
                    }),
                );
            });
        });
    });
});
