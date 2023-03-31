import * as StartTraceAgent from "../start-trace-agent-impl";

jest.mock("../start-trace-agent-impl");

describe("start-trace-agent.js export", () => {
    it("should invoke startTraceAgent on import", async () => {
        // Arrange
        const startTraceAgentSpy = jest.spyOn(
            StartTraceAgent,
            "startTraceAgent",
        );

        // Act
        await import("../start-trace-agent");

        // Assert
        expect(startTraceAgentSpy).toHaveBeenCalledTimes(1);
    });
});
