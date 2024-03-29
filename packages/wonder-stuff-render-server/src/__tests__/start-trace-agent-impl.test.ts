import * as TraceAgent from "@google-cloud/trace-agent";
import * as WSServer from "@khanacademy/wonder-stuff-server";
import {startTraceAgent} from "../start-trace-agent-impl";

jest.mock("@google-cloud/trace-agent");
jest.mock("@khanacademy/wonder-stuff-server");

describe("#startTraceAgent", () => {
    it("should start the trace agent as disabled when not in production", () => {
        // Arrange
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Development,
        );
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent();

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: false});
    });

    it("should start the trace agent as enabled when in production", () => {
        // Arrange
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Production,
        );
        const startSpy = jest.spyOn(TraceAgent, "start");

        // Act
        startTraceAgent();

        // Assert
        expect(startSpy).toHaveBeenCalledWith({enabled: true});
    });

    it("should return the tracer", () => {
        // Arrange
        const pretendTracer = {} as any;
        jest.spyOn(WSServer, "getRuntimeMode").mockReturnValue(
            WSServer.Runtime.Production,
        );
        jest.spyOn(TraceAgent, "start").mockReturnValue(pretendTracer);

        // Act
        const result = startTraceAgent();

        // Assert
        expect(result).toBe(pretendTracer);
    });
});
