import * as DebugAgent from "@google-cloud/debug-agent";
import * as Profiler from "@google-cloud/profiler";
import {Runtime} from "@khanacademy/wonder-stuff-server";
import {setupIntegrations} from "../setup-integrations";

// Google Profiler does some work on import, even before we mock the module,
// which leads to a fetch attempt that ultimately is left dangling and can
// cause wierd test output. So to stop this, we mock the google-auth-library
// that seems to be at the root of the issue, and that solves it for us.
jest.mock("google-auth-library");
jest.mock("@google-cloud/profiler");
jest.mock("@google-cloud/debug-agent");

describe("#setupIntegrations", () => {
    describe("in production", () => {
        it("should not setup @google-cloud/debug-agent if not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupIntegrations(Runtime.Production);

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should setup @google-cloud/debug-agent when options say so", async () => {
            // Arrange
            const agentSpy = jest.spyOn(DebugAgent, "start");

            // Act
            await setupIntegrations(Runtime.Production, {debugAgent: true});

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });

        it("should not setup @google-cloud/profiler when not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupIntegrations(Runtime.Production);

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should setup @google-cloud/profiler when set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupIntegrations(Runtime.Production, {profiler: true});

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });
    });

    describe.each([Runtime.Test, Runtime.Development])(
        "in %s",
        (runtime: any) => {
            it("should not setup @google-cloud/debug-agent", async () => {
                // Arrange
                const agentSpy = jest.spyOn(DebugAgent, "start");

                // Act
                await setupIntegrations(runtime);

                // Assert
                expect(agentSpy).not.toHaveBeenCalled();
            });

            it("should not setup @google-cloud/profiler", async () => {
                // Arrange
                const agentSpy = jest.spyOn(Profiler, "start");

                // Act
                await setupIntegrations(runtime);

                // Assert
                expect(agentSpy).not.toHaveBeenCalled();
            });
        },
    );
});
