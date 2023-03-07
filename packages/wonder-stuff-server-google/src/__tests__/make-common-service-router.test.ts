import * as Express from "express";
import {makeCommonServiceRouter} from "../make-common-service-router";

jest.mock("express");

describe("#makeCommonServiceRouter", () => {
    describe("route /_api/ping", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_api/ping",
                expect.any(Function),
            );
        });

        it("should send pong", () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_api/ping") || [];
            const routeHandler: any = routeArgs[1];

            // Act
            routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("pong\n");
        });
    });

    describe("route /_ah/warmup", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_ah/warmup",
                expect.any(Function),
            );
        });

        it("should invoke the warm up handler, when present", async () => {
            // Arrange
            const fakeRequest = {
                headers: "FAKE_HEADERS",
            };
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            const warmUpHandler = jest.fn().mockResolvedValue(undefined);
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION", warmUpHandler as any);
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_ah/warmup") || [];
            const routeHandler: any = routeArgs[1];

            // Act
            await routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(warmUpHandler).toHaveBeenCalledWith("FAKE_HEADERS");
        });

        it("should send OK", async () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_ah/warmup") || [];
            const routeHandler: any = routeArgs[1];

            // Act
            await routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith("OK\n");
        });
    });

    describe("route /_api/version", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            makeCommonServiceRouter("THE_VERSION");

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_api/version",
                expect.any(Function),
            );
        });

        it("should send given version", () => {
            // Arrange
            const fakeRequest = {};
            const fakeResponse = {
                send: jest.fn(),
            };
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);
            const getSpy = jest.spyOn(mockRouter, "get");
            makeCommonServiceRouter("THE_VERSION");
            const routeArgs =
                getSpy.mock.calls.find((c) => c[0] === "/_api/version") || [];
            const routeHandler: any = routeArgs[1];

            // Act
            routeHandler(fakeRequest, fakeResponse);

            // Assert
            expect(fakeResponse.send).toHaveBeenCalledWith({
                version: "THE_VERSION",
            });
        });
    });
});
