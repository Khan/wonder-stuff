import vm from "vm";
import * as JSDOM from "jsdom";
import * as CloseableVirtualConsole from "../closeable-virtual-console";
import * as PatchAgainstDanglingTimers from "../patch-against-dangling-timers";
import {JSDOMEnvironment} from "../jsdom-environment";

jest.mock("jsdom");
jest.mock("../closeable-virtual-console");
jest.mock("../patch-against-dangling-timers");

describe("JSDOMEnvironment", () => {
    beforeEach(() => {
        jest.useRealTimers();
    });

    describe("#constructor", () => {
        it("should throw if configuration is not provided", () => {
            // Arrange

            // Act
            const underTest = () => new JSDOMEnvironment(null as any);

            // Assert
            expect(underTest).toThrowErrorMatchingInlineSnapshot(
                `"Must provide environment configuration"`,
            );
        });
    });

    describe("#render", () => {
        it("should get a resource loader", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            } as const;
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeConfiguration.getResourceLoader).toHaveBeenCalledWith(
                "URL",
                fakeRenderAPI,
            );
        });

        it("should retrieve the list of files to be downloaded", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeLoader: any = {
                fetch: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn().mockReturnValue(fakeLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeConfiguration.getFileList).toHaveBeenCalledWith(
                "URL",
                fakeRenderAPI,
                expect.any(Function),
            );
        });

        it("should use the resource loader for getFileList fetching", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                getHeader: jest.fn(),
                logger: fakeLogger,
            };
            const fakeLoader: any = {
                fetch: jest.fn(),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest.fn().mockReturnValue(fakeLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const underTest = new JSDOMEnvironment(fakeConfiguration);
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Act
            const fetchFn = fakeConfiguration.getFileList.mock.calls[0][2];
            fetchFn("SOME_URL");

            // Assert
            expect(fakeLoader.fetch).toHaveBeenCalledWith("SOME_URL", {});
        });

        it("should trace the file acquisition phase", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const traceSpy = jest.fn().mockReturnValue(fakeTraceSession);
            const getFileListSpy = jest.fn().mockResolvedValue([]);
            const fakeRenderAPI: any = {
                trace: traceSpy,
                headers: {},
                logger: fakeLogger,
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: getFileListSpy,
                getResourceLoader: jest.fn(),
                afterEnvSetup: jest.fn(),
            } as const;
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(traceSpy).toHaveBeenCalledBefore(getFileListSpy);
        });

        it("should fetch the files via the resource loader", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest
                    .fn()
                    .mockImplementation((f: any) =>
                        Promise.resolve(`FETCHED: ${f}`),
                    ),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest
                    .fn()
                    .mockResolvedValue(["filea", "fileb", "filec"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("filea", {});
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("fileb", {});
            expect(fakeResourceLoader.fetch).toHaveBeenCalledWith("filec", {});
        });

        it("should throw if file fetch returns null", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockReturnValue(null),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["BAD_FILE"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const env = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const underTest = env.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"Unable to retrieve BAD_FILE. ResourceLoader returned null."`,
            );
        });

        it("should end the trace session if file acquisition throws", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(null),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["BAD_FILE"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const env = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await env.render("URL", fakeRenderAPI).catch(() => {
                /* NOTHING */
            });

            // Assert
            expect(fakeTraceSession.end).toHaveBeenCalled();
        });

        it("should end the trace session if file acquisition succeeds", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest
                    .fn()
                    .mockImplementation((f: any) =>
                        Promise.resolve(`FETCHED: ${f}`),
                    ),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest
                    .fn()
                    .mockResolvedValue(["filea", "fileb", "filec"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            const env = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await env.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeTraceSession.end).toHaveBeenCalled();
        });

        it("should create JSDOM instance for render location", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const jsdomSpy = jest.spyOn(JSDOM, "JSDOM");
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(jsdomSpy).toHaveBeenCalledWith(
                "<!DOCTYPE html><html><head></head><body></body></html>",
                {
                    url: "URL",
                    runScripts: "dangerously",
                    resources: fakeResourceLoader,
                    pretendToBeVisual: true,
                    virtualConsole: {fakeConsole: "FAKE_CONSOLE"},
                },
            );
        });

        it("should close JSDOM window on rejection", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow = {
                close: jest.fn(),
            } as const;
            const fakeJSDOM: any = {
                window: fakeWindow,
                getInternalVMContext: jest.fn().mockReturnValue(fakeWindow),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(fakeJSDOM.window.close).toHaveBeenCalled();
        });

        it("should patch the JSDOM instance against dangling timers", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const patchSpy = jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            );
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(patchSpy).toHaveBeenCalledWith(fakeWindow);
        });

        it("should close the dangling timer gate on rejection", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {};
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate: any = {
                close: jest.fn(),
            } as const;
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(fakeGate.close).toHaveBeenCalled();
        });

        it("should call afterEnvSetup", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(Buffer.from("CONTENT")),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["A", "B", "C"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const underTest = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await underTest.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeConfiguration.afterEnvSetup).toHaveBeenCalledWith(
                "URL",
                ["A", "B", "C"],
                fakeRenderAPI,
                fakeJSDOM.window,
            );
        });

        it("should invoke the closeable returned by afterEnvSetup on rejection", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {};
            const afterEnvCloseable = {
                close: jest.fn(),
            } as const;
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue([]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowError();
            expect(afterEnvCloseable.close).toHaveBeenCalled();
        });

        it("should execute the downloaded files in order in the JSDOM VM context", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockImplementation((f: any) => {
                    switch (f) {
                        case "filea":
                            return Promise.resolve(`window["gubbins"] = 42;`);

                        case "fileb":
                            return Promise.resolve(
                                `window["gubbins"] = 2 * window["gubbins"];`,
                            );
                    }
                    throw new Error(`Unexpected file: ${f}`);
                }),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea", "fileb"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            try {
                await environment.render("URL", fakeRenderAPI);
            } catch (e: any) {
                /**
                 * We care about the expectation below.
                 */
            }

            // Assert
            expect(fakeWindow).toMatchObject({
                gubbins: 84,
            });
        });

        it("should throw if no callback is registered", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockImplementation((f: any) => {
                    switch (f) {
                        case "filea":
                            return Promise.resolve(`window["gubbins"] = 42;`);

                        case "fileb":
                            return Promise.resolve(
                                `window["gubbins"] = 2 * window["gubbins"];`,
                            );
                    }
                    throw new Error(`Unexpected file: ${f}`);
                }),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea", "fileb"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const underTest = environment.render("URL", fakeRenderAPI);

            // Assert
            await expect(underTest).rejects.toThrowErrorMatchingInlineSnapshot(
                `"No render callback was registered."`,
            );
        });

        it("should invoke the registered render method and return the result", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            const result = await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(result).toEqual({
                body: "THIS IS A RENDER!",
                status: 200,
                headers: {},
            });
        });

        it("should close JSDOM window on success", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeWindow.close).toHaveBeenCalled();
        });

        it("should close the dangling timer gate on success", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn(),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate: any = {
                close: jest.fn(),
            } as const;
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeGate.close).toHaveBeenCalled();
        });

        it("should invoke the closeable returned by afterEnvSetup on success", async () => {
            // Arrange
            const fakeLogger: any = "FAKE_LOGGER";
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const afterEnvCloseable = {
                close: jest.fn(),
            } as const;
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {};
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(afterEnvCloseable.close).toHaveBeenCalled();
        });

        it("should log closeable errors", async () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
            };
            const afterEnvCloseable = {
                close: () => {
                    throw new Error("AFTER ENV GO BOOM ON CLOSE!");
                },
            } as const;
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate: any = {
                close: jest.fn(),
            } as const;
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeLogger.error).toHaveBeenCalledWith(
                "Closeable encountered an error: Error: AFTER ENV GO BOOM ON CLOSE!",
                expect.any(Object),
            );
        });

        it("should close all non-erroring closeables", async () => {
            // Arrange
            const fakeLogger: any = {
                error: jest.fn(),
            };
            const fakeTraceSession: any = {
                end: jest.fn(),
                addLabel: jest.fn(),
            };
            const fakeRenderAPI: any = {
                trace: jest.fn().mockReturnValue(fakeTraceSession),
                headers: {},
                logger: fakeLogger,
            };
            const fakeResourceLoader: any = {
                fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return {
        body: "THIS IS A RENDER!",
        status: 200,
        headers: {},
    };
}

window["__register__"](fakeRender);
`),
                close: jest.fn(),
            };
            const afterEnvCloseable = {
                close: jest
                    .fn()
                    .mockRejectedValue(
                        new Error("AFTER ENV GO BOOM ON CLOSE!"),
                    ),
            } as const;
            const fakeConfiguration = {
                registrationCallbackName: "__register__",
                getFileList: jest.fn().mockResolvedValue(["filea"]),
                getResourceLoader: jest
                    .fn()
                    .mockReturnValue(fakeResourceLoader),
                afterEnvSetup: jest.fn().mockResolvedValue(afterEnvCloseable),
            } as const;
            jest.spyOn(
                CloseableVirtualConsole,
                "CloseableVirtualConsole",
            ).mockImplementation(() => ({fakeConsole: "FAKE_CONSOLE"}) as any);
            const fakeWindow: any = {
                close: jest.fn(),
            };
            fakeWindow.window = fakeWindow;
            const fakeJSDOM: any = {
                window: vm.createContext(fakeWindow),
                getInternalVMContext: jest.fn().mockImplementation(function (
                    this: any,
                ) {
                    // This is a valid use of this for our scenario.
                    // eslint-disable-next-line @babel/no-invalid-this
                    return this.window;
                }),
            } as const;
            jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
            const fakeGate: any = {
                close: jest.fn(),
            } as const;
            jest.spyOn(
                PatchAgainstDanglingTimers,
                "patchAgainstDanglingTimers",
            ).mockReturnValue(fakeGate);
            const environment = new JSDOMEnvironment(fakeConfiguration);

            // Act
            await environment.render("URL", fakeRenderAPI);

            // Assert
            expect(fakeWindow.close).toHaveBeenCalled();
            expect(fakeGate.close).toHaveBeenCalled();
            expect(fakeResourceLoader.close).toHaveBeenCalled();
        });

        it.each([
            undefined,
            null,
            "THIS IS NOT CORRECT",
            {status: 200, headers: {}},
            {body: "NEED MORE THAN THIS"},
            {body: "THIS HELPS BUT WHERE ARE THE HEADERS", status: 200},
        ])(
            "should reject if result is malformed (%s)",
            async (testResult: any) => {
                // Arrange
                const fakeLogger: any = "FAKE_LOGGER";
                const fakeTraceSession: any = {
                    end: jest.fn(),
                    addLabel: jest.fn(),
                };
                const fakeRenderAPI: any = {
                    trace: jest.fn().mockReturnValue(fakeTraceSession),
                    headers: {},
                    logger: fakeLogger,
                };
                const fakeResourceLoader: any = {
                    fetch: jest.fn().mockResolvedValue(`
function fakeRender() {
    return ${JSON.stringify(testResult)};
}

window["__register__"](fakeRender);
`),
                };
                const fakeConfiguration = {
                    registrationCallbackName: "__register__",
                    getFileList: jest.fn().mockResolvedValue(["filea"]),
                    getResourceLoader: jest
                        .fn()
                        .mockReturnValue(fakeResourceLoader),
                    afterEnvSetup: jest.fn(),
                } as const;
                jest.spyOn(
                    CloseableVirtualConsole,
                    "CloseableVirtualConsole",
                ).mockImplementation(
                    () => ({fakeConsole: "FAKE_CONSOLE"}) as any,
                );
                const fakeWindow: any = {};
                fakeWindow.window = fakeWindow;
                const fakeJSDOM: any = {
                    window: vm.createContext(fakeWindow),
                    getInternalVMContext: jest
                        .fn()
                        .mockImplementation(function (this: any) {
                            // This is a valid use of this for our scenario.
                            // eslint-disable-next-line @babel/no-invalid-this
                            return this.window;
                        }),
                } as const;
                jest.spyOn(JSDOM, "JSDOM").mockReturnValue(fakeJSDOM);
                const environment = new JSDOMEnvironment(fakeConfiguration);

                // Act
                const underTest = environment.render("URL", fakeRenderAPI);

                // Assert
                await expect(underTest).rejects.toThrowErrorMatchingSnapshot();
            },
        );
    });
});
