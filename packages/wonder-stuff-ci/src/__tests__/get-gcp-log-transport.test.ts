import {getGCPLogTransport} from "../get-gcp-log-transport";

describe("#getGCPLogTransport", () => {
    it("return the mobile release logger", () => {
        // Act
        const result = getGCPLogTransport({
            projectId: "mobile-365917",
            logName: "release-raccoon",
            level: "info",
            redirectToStdout: true,
            labels: {},
        });

        // Assert
        expect(result).toBeTruthy();
        expect(result.level).toStrictEqual("info");
    });
});
