import * as Profiler from "@google-cloud/profiler";
import {Runtime} from "../types";
import {setupGoogleCloudIntegrations} from "../setup-google-cloud-integrations";

// Google Profiler does some work on import, even before we mock the module,
// which leads to a fetch attempt that ultimately is left dangling and can
// cause wierd test output. So to stop this, we mock the google-auth-library
// that seems to be at the root of the issue, and that solves it for us.
jest.mock("google-auth-library");
jest.mock("@google-cloud/profiler");

describe("#setupGoogleCloudIntegrations", () => {
    describe("in production", () => {
        it("should not setup @google-cloud/profiler when not set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupGoogleCloudIntegrations(Runtime.Production);

            // Assert
            expect(agentSpy).not.toHaveBeenCalled();
        });

        it("should setup @google-cloud/profiler when set to", async () => {
            // Arrange
            const agentSpy = jest.spyOn(Profiler, "start");

            // Act
            await setupGoogleCloudIntegrations(Runtime.Production, {
                profiler: true,
            });

            // Assert
            expect(agentSpy).toHaveBeenCalled();
        });
    });

    describe.each([Runtime.Test, Runtime.Development])(
        "in %s",
        (runtime: any) => {
            it("should not setup @google-cloud/profiler", async () => {
                // Arrange
                const agentSpy = jest.spyOn(Profiler, "start");

                // Act
                await setupGoogleCloudIntegrations(runtime);

                // Assert
                expect(agentSpy).not.toHaveBeenCalled();
            });
        },
    );
});
