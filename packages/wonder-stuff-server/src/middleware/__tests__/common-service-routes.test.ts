import * as Express from "express";
import * as GetAppEngineInfo from "../../get-app-engine-info";
import {commonServiceRoutes} from "../common-service-routes";

jest.mock("express");
jest.mock("../../get-app-engine-info");

describe("#commonServiceRoutes", () => {
    beforeEach(() => {
        jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
            version: "THE_VERSION",
        } as any);
    });

    describe("route /_api/ping", () => {
        it("should be defined", () => {
            // Arrange
            const mockRouter: any = {
                get: jest.fn().mockReturnThis(),
            };
            jest.spyOn(Express, "Router").mockReturnValue(mockRouter);

            // Act
            commonServiceRoutes();

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
            commonServiceRoutes();
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
            commonServiceRoutes();

            // Assert
            expect(mockRouter.get).toHaveBeenCalledWith(
                "/_ah/warmup",
                expect.any(Function),
            );
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
            commonServiceRoutes();
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
            commonServiceRoutes();

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
            commonServiceRoutes();
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
