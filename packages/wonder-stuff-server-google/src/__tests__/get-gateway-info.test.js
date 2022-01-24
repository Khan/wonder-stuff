// @flow
import {getGatewayInfo} from "../get-gateway-info.js";

const resetEnv = (name: string, value: ?string): void => {
    if (value == null) {
        delete process.env[name];
    } else {
        process.env[name] = value;
    }
};

describe("#getGatewayInfo", () => {
    const GAE_SERVICE = process.env.GAE_SERVICE;
    const GAE_VERSION = process.env.GAE_VERSION;
    const GAE_INSTANCE = process.env.GAE_INSTANCE;
    afterEach(() => {
        resetEnv("GAE_SERVICE", GAE_SERVICE);
        resetEnv("GAE_VERSION", GAE_VERSION);
        resetEnv("GAE_INSTANCE", GAE_INSTANCE);
    });

    it("should return values from GAE_SERVICE and GAE_VERSION", () => {
        // Arrange
        process.env.GAE_SERVICE = "NAME";
        process.env.GAE_VERSION = "VERSION";
        process.env.GAE_INSTANCE = "INSTANCE";

        // Act
        const result = getGatewayInfo();

        // Assert
        expect(result).toStrictEqual({
            name: "NAME",
            version: "VERSION",
            instance: "INSTANCE",
            pid: process.pid,
        });
    });

    it("should return unknown if GAE_SERVICE and GAE_VERSION not set", () => {
        // Arrange
        /**
         * We have to delete the env vars.
         *
         * If we just set them to undefined they actually get set to the
         * string "undefined", which is not what we want at all.
         */
        delete process.env.GAE_SERVICE;
        delete process.env.GAE_VERSION;
        delete process.env.GAE_INSTANCE;

        // Act
        const result = getGatewayInfo();

        // Assert
        expect(result).toStrictEqual({
            name: "unknown",
            version: "unknown",
            instance: "unknown",
            pid: process.pid,
        });
    });
});
