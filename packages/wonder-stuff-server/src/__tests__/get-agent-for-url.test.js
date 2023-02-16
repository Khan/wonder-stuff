// @flow
import {URL} from "url";

describe("#getAgentForURL", () => {
    beforeEach(() => {
        /**
         * Since we store state in the module under test, we need to reset that
         * state before each test case so we know test order is irrelevant.
         * This ensures that test cases can be debugged in isolation, etc.
         */
        jest.resetModules();

        /**
         * We reset these because some tests may override these with custom
         * variations that throw to detect improper imports, and unfortunately,
         * just jest.mock("http") does not override custom factories.
         */
        jest.mock("http", () => ({
            Agent: jest.fn(),
        }));
        jest.mock("https", () => ({
            Agent: jest.fn(),
        }));

        /**
         * Because we are resetting the module registry before each test case,
         * we need to require after the reset. If we imported at the top of the
         * file instead, they would not match the modules that our code under
         * test loads.
         */
    });

    it("should create new HTTP agent", () => {
        // Arrange
        const Http = require("http");
        const {getAgentForURL} = require("../get-agent-for-url");
        const httpSpy = jest.spyOn(Http, "Agent");

        // Act
        getAgentForURL(new URL("http://www.example.com"));

        // Assert
        expect(httpSpy).toHaveBeenCalledWith({
            keepAlive: true,
        });
    });

    it("should not import HTTPS for HTTP url", () => {
        // Arrange
        const {getAgentForURL} = require("../get-agent-for-url");
        jest.mock("https", () => {
            throw new Error("Naughty! Should not import HTTPS for an HTTP URL");
        });

        // Act
        const underTest = () =>
            getAgentForURL(new URL("http://www.example.com"));

        // Assert
        expect(underTest).not.toThrow();
    });

    it("should create new HTTPS agent", () => {
        // Arrange
        const Https = require("https");
        const {getAgentForURL} = require("../get-agent-for-url");
        const httpSpy = jest.spyOn(Https, "Agent");

        // Act
        getAgentForURL(new URL("https://www.example.com"));

        // Assert
        expect(httpSpy).toHaveBeenCalledWith({
            keepAlive: true,
        });
    });

    it("should not import HTTP for HTTPS url", () => {
        // Arrange
        const {getAgentForURL} = require("../get-agent-for-url");
        jest.mock("http", () => {
            throw new Error("Naughty! Should not import HTTP for an HTTPS URL");
        });

        // Act
        const underTest = () =>
            getAgentForURL(new URL("https://www.example.com"));

        // Assert
        expect(underTest).not.toThrow();
    });

    it("should throw for a protocol other than HTTP or HTTPS", () => {
        // Arrange
        const {getAgentForURL} = require("../get-agent-for-url");

        // Act
        const underTest = () =>
            getAgentForURL(new URL("ftp://this.is.not.right.com"));

        // Assert
        expect(underTest).toThrowErrorMatchingInlineSnapshot(
            `"Unsupported protocol"`,
        );
    });
});
