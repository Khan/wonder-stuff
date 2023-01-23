import * as GetAppEngineInfo from "../get-app-engine-info";
import {traceImpl} from "../trace-impl";

jest.mock("../get-app-engine-info");

describe("#trace", () => {
    it.each([[""], [null], [undefined]])(
        "should throw if the action is empty/falsy",
        (testPoint: any) => {
            // Arrange
            const fakeLogger = ({} as any);
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
            jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
                name: "GATEWAY_NAME",
                version: "GATEWAY_VERSION",
            });

            // Act
            const underTest = () => traceImpl(fakeLogger, testPoint, "MESSAGE");

            // Assert
            expect(underTest).toThrowErrorMatchingSnapshot();
        },
    );

    it("should log the start of the session", () => {
        // Arrange
        const fakeLogger = ({
            silly: jest.fn(),
            startTimer: jest.fn(),
        } as any);
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
        jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        traceImpl(fakeLogger, "ACTION", "MESSAGE");

        // Assert
        expect(fakeLogger.silly).toHaveBeenCalledWith("TRACE ACTION: MESSAGE");
    });

    it("should start a timer", () => {
        // Arrange
        const fakeLogger = ({
            silly: jest.fn(),
            startTimer: jest.fn(),
        } as any);
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
        jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        traceImpl(fakeLogger, "ACTION", "MESSAGE");

        // Assert
        expect(fakeLogger.startTimer).toHaveBeenCalled();
    });

    it("should create a tracer span", () => {
        // Arrange
        const fakeLogger: any = {
            silly: jest.fn(),
            startTimer: jest.fn(),
        };
        const fakeTracer: any = {
            createChildSpan: jest.fn(),
        };
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
        jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        traceImpl(fakeLogger, "ACTION", "MESSAGE", fakeTracer);

        // Assert
        expect(fakeTracer.createChildSpan).toHaveBeenCalledWith({
            name: "GATEWAY_NAME.ACTION",
        });
    });

    it("should return a trace session", () => {
        // Arrange
        const fakeLogger: any = {
            silly: jest.fn(),
            startTimer: jest.fn(),
        };
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
        jest.spyOn(GetAppEngineInfo, "getAppEngineInfo").mockReturnValue({
            name: "GATEWAY_NAME",
            version: "GATEWAY_VERSION",
        });

        // Act
        const result = traceImpl(fakeLogger, "ACTION", "MESSAGE");

        // Assert
        expect(result).toBeDefined();
    });

    describe("trace session", () => {
        describe("#action", () => {
            it("should give action of the trace", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
                const result = session.action;

                // Assert
                expect(result).toBe("ACTION");
            });

            it("should be read-only", () => {
                // Arrange
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn(),
                };
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
// @ts-expect-error - TS2322 - Type 'string' is not assignable to type '() => string'.
                const underTest = () => (session.action = "NEW_ACTION!");

                // Assert
                expect(underTest).toThrowErrorMatchingInlineSnapshot(
                    `"Cannot set property action of #<Object> which has only a getter"`,
                );
            });
        });

        describe("#addLabel", () => {
            it("should add the label to the span", () => {});
        });

        describe("#end", () => {
            it("should stop the profile timer", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end();

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    "/memory/delta": {
                        someMemoryStuff: 40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 50000,
                    },
                });
            });

            it("should use the log level given", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({level: "silly"});

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "silly",
                    "/memory/delta": {
                        someMemoryStuff: 40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 50000,
                    },
                });
            });

            it("should add labels to metadata", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");
                session.addLabel("LABEL_A", "label_a");
                session.addLabel("/label/b", "label_b");

                // Act
                session.end();

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    "/memory/delta": {
                        someMemoryStuff: 40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 50000,
                    },
                    LABEL_A: "label_a",
                    "/label/b": "label_b",
                });
            });

            it("should use the given metadata info", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                    "/memory/delta": {
                        someMemoryStuff: -40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 10000,
                    },
                });
            });

            it("should override labels with metadata", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");
                session.addLabel("cached", false);
                session.addLabel("/label/b", "label_b");

                // Act
                session.end({
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    cached: true,
                    size: 56,
                    someotherrubbish: "blahblahblah",
                    "/memory/delta": {
                        someMemoryStuff: 40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 50000,
                    },
                    "/label/b": "label_b",
                });
            });

            it("should not allow message to be overridden", () => {
                // Arrange
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(process, "memoryUsage")
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 10000,
                    })
                    .mockReturnValueOnce({
// @ts-expect-error - TS2345 - Argument of type '{ someMemoryStuff: number; }' is not assignable to parameter of type 'MemoryUsage'.
                        someMemoryStuff: 50000,
                    });
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(fakeLogger, "ACTION", "MESSAGE");

                // Act
                session.end({
                    message: "I secretly want to change the message",
                });

                // Assert
                expect(fakeTimer.done).toHaveBeenCalledWith({
                    message: "TRACED ACTION: MESSAGE",
                    level: "debug",
                    "/memory/delta": {
                        someMemoryStuff: 40000,
                    },
                    "/memory/final": {
                        someMemoryStuff: 50000,
                    },
                });
            });

            it("should end the trace span", () => {
                // Arrange
                const fakeTraceSpan = {
                    addLabel: jest.fn(),
                    endSpan: jest.fn(),
                } as const;
                const fakeTracer: any = {
                    createChildSpan: jest.fn().mockReturnValue(fakeTraceSpan),
                };
                const fakeTimer = {
                    done: jest.fn(),
                } as const;
                const fakeLogger: any = {
                    silly: jest.fn(),
                    startTimer: jest.fn().mockReturnValue(fakeTimer),
                };
                jest.spyOn(
                    GetAppEngineInfo,
                    "getAppEngineInfo",
// @ts-expect-error - TS2345 - Argument of type '{ name: string; version: string; }' is not assignable to parameter of type 'AppEngineInfo'.
                ).mockReturnValue({
                    name: "GATEWAY_NAME",
                    version: "GATEWAY_VERSION",
                });
                const session = traceImpl(
                    fakeLogger,
                    "ACTION",
                    "MESSAGE",
                    fakeTracer,
                );

                // Act
                session.end();

                // Assert
                expect(fakeTraceSpan.endSpan).toHaveBeenCalled();
            });
        });
    });
});
