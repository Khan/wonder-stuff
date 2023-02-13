// @flow
import * as TraceAgent from "@google-cloud/trace-agent";
import * as Server from "@khanacademy/wonder-stuff-server";
import * as TraceImpl from "../trace-impl";

import {trace} from "../trace";

jest.mock("@google-cloud/trace-agent");
jest.mock("../trace-impl");

describe("#trace", () => {
    describe("with request", () => {
        it("should pass request to getLogger", () => {
            // Arrange
            const fakeRequest: $FlowFixMe = ({
                url: "",
            }: $FlowFixMe);
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            const getLoggerSpy = jest
                .spyOn(Server, "getLogger")
                .mockReturnValue(fakeLogger);

            // Act
            trace("TRACE_THIS!", "MESSAGE", fakeRequest);

            // Assert
            expect(getLoggerSpy).toHaveBeenCalledWith(fakeRequest);
        });

        it("should invoke the shared trace implementation with the logger and tracer", () => {
            // Arrange
            const fakeRequest: $FlowFixMe = ({
                url: "",
            }: $FlowFixMe);
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            jest.spyOn(Server, "getLogger").mockReturnValue(fakeLogger);
            const traceImplSpy = jest.spyOn(TraceImpl, "traceImpl");

            // Act
            trace("TRACE_THIS!", "MESSAGE", fakeRequest);

            // Assert
            expect(traceImplSpy).toHaveBeenCalledWith(
                fakeLogger,
                "TRACE_THIS!",
                "MESSAGE",
                fakeTracer,
            );
        });

        it("should return the trace session", () => {
            // Arrange
            const fakeTraceSession: $FlowFixMe = ({}: $FlowFixMe);
            const fakeRequest: $FlowFixMe = ({
                url: "",
            }: $FlowFixMe);
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            jest.spyOn(Server, "getLogger").mockReturnValue(fakeLogger);
            jest.spyOn(TraceImpl, "traceImpl").mockReturnValue(
                fakeTraceSession,
            );

            // Act
            const result = trace("TRACE_THIS!", "MESSAGE", fakeRequest);

            // Assert
            expect(result).toBe(fakeTraceSession);
        });
    });

    describe("without logger nor request", () => {
        it("should invoke the shared trace implementation with the logger and tracer", () => {
            // Arrange
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            jest.spyOn(Server, "getLogger").mockReturnValue(fakeLogger);
            const traceImplSpy = jest.spyOn(TraceImpl, "traceImpl");

            // Act
            trace("TRACE_THIS!", "MESSAGE");

            // Assert
            expect(traceImplSpy).toHaveBeenCalledWith(
                fakeLogger,
                "TRACE_THIS!",
                "MESSAGE",
                fakeTracer,
            );
        });

        it("should return the trace session", () => {
            // Arrange
            const fakeTraceSession: $FlowFixMe = ({}: $FlowFixMe);
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            jest.spyOn(Server, "getLogger").mockReturnValue(fakeLogger);
            jest.spyOn(TraceImpl, "traceImpl").mockReturnValue(
                fakeTraceSession,
            );

            // Act
            const result = trace("TRACE_THIS!", "MESSAGE");

            // Assert
            expect(result).toBe(fakeTraceSession);
        });
    });

    describe("with logger", () => {
        it("should invoke the shared trace implementation with the logger and tracer", () => {
            // Arrange
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            const traceImplSpy = jest.spyOn(TraceImpl, "traceImpl");

            // Act
            trace("TRACE_THIS!", "MESSAGE", fakeLogger);

            // Assert
            expect(traceImplSpy).toHaveBeenCalledWith(
                fakeLogger,
                "TRACE_THIS!",
                "MESSAGE",
                fakeTracer,
            );
        });

        it("should return the trace session", () => {
            // Arrange
            const fakeTraceSession: $FlowFixMe = ({}: $FlowFixMe);
            const fakeLogger: $FlowFixMe = ({}: $FlowFixMe);
            const fakeTracer: $FlowFixMe = ({}: $FlowFixMe);
            jest.spyOn(TraceAgent, "get").mockReturnValue(fakeTracer);
            jest.spyOn(TraceImpl, "traceImpl").mockReturnValue(
                fakeTraceSession,
            );

            // Act
            const result = trace("TRACE_THIS!", "MESSAGE", fakeLogger);

            // Assert
            expect(result).toBe(fakeTraceSession);
        });
    });
});
