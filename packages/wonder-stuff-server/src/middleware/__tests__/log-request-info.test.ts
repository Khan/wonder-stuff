import * as GetLogger from "../../get-logger";
import {logRequestInfo} from "../log-request-info";

jest.mock("../../get-logger");

describe("#logRequestInfo", () => {
    it("should log the request info", async () => {
        // Arrange
        const fakeNext = jest.fn();
        const fakeLogger: any = {
            info: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
                ANOTHER: "ANOTHER VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfo(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeLogger.info).toHaveBeenCalledTimes(1);
        expect(fakeLogger.info.mock.calls[0]).toMatchInlineSnapshot(`
            [
              "Request received: URL",
              {
                "allHeaders": "HEADER: VALUE
            ANOTHER: ANOTHER VALUE
            ",
                "method": "GET",
                "url": "URL",
              },
            ]
        `);
    });

    it("should continue", async () => {
        // Arrange
        const fakeNext = jest.fn();
        const fakeLogger: any = {
            info: jest.fn(),
        };
        const fakeRequest: any = {
            url: "URL",
            headers: {
                HEADER: "VALUE",
            },
            method: "GET",
        };
        const fakeResponse: any = {};
        jest.spyOn(GetLogger, "getLogger").mockReturnValue(fakeLogger);

        // Act
        logRequestInfo(fakeRequest, fakeResponse, fakeNext);

        // Assert
        expect(fakeNext).toHaveBeenCalledTimes(1);
    });
});
