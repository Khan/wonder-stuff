// @flow
import I18nPlugin from "../i18n-plugin.js";

import type {TranslatedLocaleStrings} from "../../utils/i18n-utils.js";
import type {TranslatedStrings, Assets} from "../i18n-plugin.js";

describe("I18nPlugin", () => {
    describe("constructor", () => {
        it("errors when there are no arguments", () => {
            // Arrange

            // Act

            // Assert
            expect(() => {
                // $FlowIgnore
                new I18nPlugin(); // eslint-disable-line no-new
            }).toThrowErrorMatchingInlineSnapshot(
                `"I18nPlugin requires options"`,
            );
        });

        it("errors when there are no locales", () => {
            // Arrange

            // Act

            // Assert
            expect(() => {
                // $FlowIgnore
                new I18nPlugin({}); // eslint-disable-line no-new
            }).toThrowErrorMatchingInlineSnapshot(
                `"Must provide locales to localize to"`,
            );
        });

        it("errors when there is no getI18nStrings", () => {
            // Arrange

            // Act

            // Assert
            expect(() => {
                // $FlowIgnore
                new I18nPlugin({locales: []}); // eslint-disable-line no-new
            }).toThrowErrorMatchingInlineSnapshot(
                `"Must provide a function to get the strings to localize"`,
            );
        });
    });

    describe("getTranslatedString", () => {
        it("handles loading data for multiple locales", async () => {
            // Arrange
            const esResult: TranslatedLocaleStrings = {
                hello: "hola",
                "%(num)s cat": {
                    lang: "es",
                    messages: ["%(num)s gato", "%(num)s gatos"],
                },
            };

            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest
                    .fn()
                    .mockImplementation((locale: string) => {
                        if (locale === "es") {
                            return Promise.resolve(esResult);
                        }
                        return Promise.resolve({});
                    }),
            });

            // Act
            const result = await plugin.getTranslatedStrings(locales);

            // Assert
            expect(result).toEqual({
                es: esResult,
                pt: {},
            });
        });

        it("logs out helpful messages when not silent", async () => {
            // Arrange
            const consoleSpy = jest
                .spyOn(console, "log")
                .mockImplementation(() => {});

            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: false,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            await plugin.getTranslatedStrings(locales);

            // Assert
            expect(consoleSpy).toHaveBeenCalledTimes(2);
        });

        it("logs out timing details, if enabled", async () => {
            // Arrange
            const locales = ["es", "pt"];
            const timingName = "I18nPlugin/Translation/get-strings";
            const timingStart = jest.fn();
            const timingEnd = jest.fn();
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                timing: {
                    start: timingStart,
                    end: timingEnd,
                },
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            await plugin.getTranslatedStrings(locales);

            // Assert
            expect(timingStart).toHaveBeenCalledWith(timingName);
            expect(timingEnd).toHaveBeenCalledWith(timingName);
        });
    });

    describe("translateAssets", () => {
        it("translates the JS assets", () => {
            // Arrange
            const translatedStrings: TranslatedStrings = {
                es: {
                    hello: "hola",
                    "%(num)s cat": {
                        lang: "es",
                        messages: ["%(num)s gato", "%(num)s gatos"],
                    },
                },
                pt: {
                    hello: "hola-pt",
                    "%(num)s cat": {
                        lang: "pt",
                        messages: ["%(num)s gato-pt", "%(num)s gatos-pt"],
                    },
                },
            };
            const assets = {
                "test.deadbeefc0ffeec0ffee.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
                "test-pluralonly.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            const hashMap = plugin.translateAssets({
                assets,
                translatedStrings,
                localizeRuntimeFiles: false,
            });

            // Assert
            expect(hashMap).toMatchInlineSnapshot(`
                Object {
                  "es": Object {
                    "deadbeefc0ffeec0ffe2": "d7faf1cad41c4309243e",
                    "deadbeefc0ffeec0ffee": "61f400bdaa4a195c4a75",
                  },
                  "pt": Object {
                    "deadbeefc0ffeec0ffe2": "589f3c441f0d1b0bc9ee",
                    "deadbeefc0ffeec0ffee": "7d2fd638ebd4e80b7611",
                  },
                }
            `);

            // We need to convert the assets into a form so that we can
            // more easily compare the output.
            const stringAssets = {};
            for (const assetName of Object.keys(assets)) {
                stringAssets[assetName] = {
                    source: assets[assetName].source(),
                    size: assets[assetName].size(),
                };
            }

            expect(stringAssets).toMatchInlineSnapshot(`
                Object {
                  "../es/test-pluralonly.d7faf1cad41c4309243e.js": Object {
                    "size": 83,
                    "source": "i18n.ngettext({\\"lang\\":\\"es\\",\\"messages\\":[\\"%(num)s gato\\",\\"%(num)s gatos\\"]}, {num: 1});",
                  },
                  "../es/test.61f400bdaa4a195c4a75.js": Object {
                    "size": 99,
                    "source": "i18n._(\\"hola\\");
                i18n.ngettext({\\"lang\\":\\"es\\",\\"messages\\":[\\"%(num)s gato\\",\\"%(num)s gatos\\"]}, {num: 1});",
                  },
                  "../pt/test-pluralonly.589f3c441f0d1b0bc9ee.js": Object {
                    "size": 89,
                    "source": "i18n.ngettext({\\"lang\\":\\"pt\\",\\"messages\\":[\\"%(num)s gato-pt\\",\\"%(num)s gatos-pt\\"]}, {num: 1});",
                  },
                  "../pt/test.7d2fd638ebd4e80b7611.js": Object {
                    "size": 108,
                    "source": "i18n._(\\"hola-pt\\");
                i18n.ngettext({\\"lang\\":\\"pt\\",\\"messages\\":[\\"%(num)s gato-pt\\",\\"%(num)s gatos-pt\\"]}, {num: 1});",
                  },
                  "test-pluralonly.deadbeefc0ffeec0ffe2.js": Object {
                    "size": 1,
                    "source": "i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});",
                  },
                  "test.deadbeefc0ffeec0ffee.js": Object {
                    "size": 1,
                    "source": "i18n._('hello');
                i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});",
                  },
                }
            `);
        });

        it("errors out when there is a missing hash", () => {
            // Arrange
            const assets: Assets = {
                "test.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act & Assert
            expect(() => {
                plugin.translateAssets({
                    assets,
                    translatedStrings: {},
                    localizeRuntimeFiles: false,
                });
            }).toThrowErrorMatchingInlineSnapshot(
                `"test.js is missing hash in filename."`,
            );
        });

        it("copies non-JS files, instead of translating them", () => {
            // Arrange
            const assets = {
                "test.css": {
                    source() {
                        return "body { background: red; }";
                    },
                    size() {
                        return 1;
                    },
                },
                "font.woff2": {
                    source() {
                        return "FONT";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            plugin.translateAssets({
                assets,
                translatedStrings: {},
                localizeRuntimeFiles: false,
            });

            // Assert
            // We need to convert the assets into a form so that we can
            // more easily compare the output.
            const stringAssets = {};
            for (const assetName of Object.keys(assets)) {
                stringAssets[assetName] = {
                    source: assets[assetName].source(),
                    size: assets[assetName].size(),
                };
            }

            expect(stringAssets).toMatchInlineSnapshot(`
                Object {
                  "../es/font.woff2": Object {
                    "size": 4,
                    "source": "FONT",
                  },
                  "../es/test.css": Object {
                    "size": 25,
                    "source": "body { background: red; }",
                  },
                  "../pt/font.woff2": Object {
                    "size": 4,
                    "source": "FONT",
                  },
                  "../pt/test.css": Object {
                    "size": 25,
                    "source": "body { background: red; }",
                  },
                  "font.woff2": Object {
                    "size": 1,
                    "source": "FONT",
                  },
                  "test.css": Object {
                    "size": 1,
                    "source": "body { background: red; }",
                  },
                }
            `);
        });

        it("updates paths & hashes in runtime and chunk-map files", () => {
            // Arrange
            const translatedStrings: TranslatedStrings = {
                es: {
                    hello: "hola",
                    "%(num)s cat": {
                        lang: "es",
                        messages: ["%(num)s gato", "%(num)s gatos"],
                    },
                },
                pt: {
                    hello: "hola-pt",
                    "%(num)s cat": {
                        lang: "pt",
                        messages: ["%(num)s gato-pt", "%(num)s gatos-pt"],
                    },
                },
            };
            const assets: Assets = {
                "test.deadbeefc0ffeec0ffee.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
                "runtime.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "const a = require('./prod/en/test.deadbeefc0ffeec0ffee.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                [`chunk-map.deadbeefc0ffeec0ffe2.js`]: {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
                shouldLocalizeAsset: (assetName) =>
                    assetName.startsWith("runtime.") ||
                    assetName.startsWith("chunk-map."),
            });

            // Act
            plugin.translateAssets({
                assets,
                translatedStrings,
                localizeRuntimeFiles: true,
            });

            // Assert
            // We need to convert the assets into a form so that we can
            // more easily compare the output.
            const stringAssets = {};
            for (const assetName of Object.keys(assets)) {
                stringAssets[assetName] = {
                    source: assets[assetName].source(),
                    size: assets[assetName].size(),
                };
            }

            expect(stringAssets).toMatchInlineSnapshot(`
                Object {
                  "../es/chunk-map.762229792cee567e752a.js": Object {
                    "size": 63,
                    "source": "const a = require('./prod/es/runtime.4ae449f863c7368929c1.js');",
                  },
                  "../es/runtime.4ae449f863c7368929c1.js": Object {
                    "size": 60,
                    "source": "const a = require('./prod/es/test.deadbeefc0ffeec0ffee.js');",
                  },
                  "../pt/chunk-map.c514d24bb60c80085da1.js": Object {
                    "size": 63,
                    "source": "const a = require('./prod/pt/runtime.e89080547a41feb7e5d2.js');",
                  },
                  "../pt/runtime.e89080547a41feb7e5d2.js": Object {
                    "size": 60,
                    "source": "const a = require('./prod/pt/test.deadbeefc0ffeec0ffee.js');",
                  },
                  "chunk-map.deadbeefc0ffeec0ffe2.js": Object {
                    "size": 1,
                    "source": "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');",
                  },
                  "runtime.deadbeefc0ffeec0ffe2.js": Object {
                    "size": 1,
                    "source": "const a = require('./prod/en/test.deadbeefc0ffeec0ffee.js');",
                  },
                  "test.deadbeefc0ffeec0ffee.js": Object {
                    "size": 1,
                    "source": "i18n._('hello');
                i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});",
                  },
                }
            `);
        });

        it("outputs messages wen not silent", () => {
            // Arrange
            const consoleSpy = jest
                .spyOn(console, "log")
                .mockImplementation(() => {});
            const translatedStrings: TranslatedStrings = {
                es: {
                    hello: "hola",
                    "%(num)s cat": {
                        lang: "es",
                        messages: ["%(num)s gato", "%(num)s gatos"],
                    },
                },
                pt: {
                    hello: "hola-pt",
                    "%(num)s cat": {
                        lang: "pt",
                        messages: ["%(num)s gato-pt", "%(num)s gatos-pt"],
                    },
                },
            };
            const assets: Assets = {
                "test.deadbeefc0ffeec0ffee.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
                "test-pluralonly.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: false,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            plugin.translateAssets({
                assets,
                translatedStrings,
                localizeRuntimeFiles: false,
            });

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith("Translating JS files...");
        });

        it("tracks perf timing", () => {
            // Arrange
            const translatedStrings: TranslatedStrings = {
                es: {
                    hello: "hola",
                    "%(num)s cat": {
                        lang: "es",
                        messages: ["%(num)s gato", "%(num)s gatos"],
                    },
                },
                pt: {
                    hello: "hola-pt",
                    "%(num)s cat": {
                        lang: "pt",
                        messages: ["%(num)s gato-pt", "%(num)s gatos-pt"],
                    },
                },
            };
            const assets: Assets = {
                "test.deadbeefc0ffeec0ffee.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
                "test-pluralonly.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const timingName = "I18nPlugin/Translation/translation";
            const timingStart = jest.fn();
            const timingEnd = jest.fn();
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                timing: {
                    start: timingStart,
                    end: timingEnd,
                },
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            plugin.translateAssets({
                assets,
                translatedStrings,
                localizeRuntimeFiles: false,
            });

            // Assert
            expect(timingStart).toHaveBeenCalledWith(timingName);
            expect(timingEnd).toHaveBeenCalledWith(timingName);
        });
    });

    describe("localizeManifests", () => {
        it("can localize manifest and HTML files", () => {
            // Arrange
            const hashMap = {
                es: {
                    deadbeefc0ffeec0ffe2: "954f8bb39a2f4b534b54",
                    deadbeefc0ffeec0ffee: "634fbfd25850683c5cb1",
                },
                pt: {
                    deadbeefc0ffeec0ffe2: "efba0b9130c816f63328",
                    deadbeefc0ffeec0ffee: "68b8d9a0a2ba472e983b",
                },
            };
            const assets = {
                "test.deadbeefc0ffeec0ffee.js": {
                    source() {
                        return "i18n._('hello');\ni18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});";
                    },
                    size() {
                        return 1;
                    },
                },
                "runtime.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "const a = require('./prod/en/test.deadbeefc0ffeec0ffee.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "chunk-map.deadbeefc0ffeec0ffe2.js": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../manifests/en/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/en/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
                "../manifests/es/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/es/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
                "../manifests/pt/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/pt/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const getLocalePath = (locale) => `/prod/${locale}`;
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
                getLocalePath,
                shouldLocalizeManifest: (assetName, locale) =>
                    assetName.includes(`/${locale}/`),
            });

            // Act
            plugin.localizeManifests({assets, hashMap});

            // Assert
            // We need to convert the assets into a form so that we can
            // more easily compare the output.
            const stringAssets = {};
            for (const assetName of Object.keys(assets)) {
                stringAssets[assetName] = {
                    source: assets[assetName].source(),
                    size: assets[assetName].size(),
                };
            }

            expect(stringAssets).toMatchInlineSnapshot(`
                Object {
                  "../manifests/en/webpack-manifest-1234.json": Object {
                    "size": 1,
                    "source": "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');",
                  },
                  "../manifests/es/webpack-manifest-1234.json": Object {
                    "size": 63,
                    "source": "const a = require('./prod/es/runtime.954f8bb39a2f4b534b54.js');",
                  },
                  "../manifests/pt/webpack-manifest-1234.json": Object {
                    "size": 63,
                    "source": "const a = require('./prod/pt/runtime.efba0b9130c816f63328.js');",
                  },
                  "../pages/en/page-1234.html": Object {
                    "size": 1,
                    "source": "<script src=\\"/prod/en/runtime.deadbeefc0ffeec0ffe2.js\\"></script>",
                  },
                  "../pages/es/page-1234.html": Object {
                    "size": 64,
                    "source": "<script src=\\"/prod/es/runtime.954f8bb39a2f4b534b54.js\\"></script>",
                  },
                  "../pages/pt/page-1234.html": Object {
                    "size": 64,
                    "source": "<script src=\\"/prod/pt/runtime.efba0b9130c816f63328.js\\"></script>",
                  },
                  "chunk-map.deadbeefc0ffeec0ffe2.js": Object {
                    "size": 1,
                    "source": "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');",
                  },
                  "runtime.deadbeefc0ffeec0ffe2.js": Object {
                    "size": 1,
                    "source": "const a = require('./prod/en/test.deadbeefc0ffeec0ffee.js');",
                  },
                  "test.deadbeefc0ffeec0ffee.js": Object {
                    "size": 1,
                    "source": "i18n._('hello');
                i18n.ngettext('%(num)s cat', '%(num)s cats', {num: 1});",
                  },
                }
            `);
        });

        it("logs to console when not silent", () => {
            // Arrange
            const consoleSpy = jest
                .spyOn(console, "log")
                .mockImplementation(() => {});
            const hashMap = {
                es: {
                    deadbeefc0ffeec0ffe2: "954f8bb39a2f4b534b54",
                    deadbeefc0ffeec0ffee: "634fbfd25850683c5cb1",
                },
                pt: {
                    deadbeefc0ffeec0ffe2: "efba0b9130c816f63328",
                    deadbeefc0ffeec0ffee: "68b8d9a0a2ba472e983b",
                },
            };
            const assets: Assets = {
                "../manifests/es/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/es/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
                "../manifests/pt/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/pt/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const getLocalePath = (locale) => `/prod/${locale}`;
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: false,
                getI18nStrings: jest.fn().mockResolvedValue({}),
                getLocalePath,
            });

            // Act
            plugin.localizeManifests({assets, hashMap});

            // Assert
            expect(consoleSpy).toHaveBeenCalledWith(
                "Updating manifests for es ????????",
            );
            expect(consoleSpy).toHaveBeenCalledWith(
                "Updating manifests for pt ????????",
            );
        });

        it("tracks perf timing", () => {
            // Arrange
            const hashMap = {
                es: {
                    deadbeefc0ffeec0ffe2: "954f8bb39a2f4b534b54",
                    deadbeefc0ffeec0ffee: "634fbfd25850683c5cb1",
                },
                pt: {
                    deadbeefc0ffeec0ffe2: "efba0b9130c816f63328",
                    deadbeefc0ffeec0ffee: "68b8d9a0a2ba472e983b",
                },
            };
            const assets: Assets = {
                "../manifests/es/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/es/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
                "../manifests/pt/webpack-manifest-1234.json": {
                    source() {
                        return "const a = require('./prod/en/runtime.deadbeefc0ffeec0ffe2.js');";
                    },
                    size() {
                        return 1;
                    },
                },
                "../pages/pt/page-1234.html": {
                    source() {
                        return `<script src="/prod/en/runtime.deadbeefc0ffeec0ffe2.js"></script>`;
                    },
                    size() {
                        return 1;
                    },
                },
            };
            const locales = ["es", "pt"];
            const timingName = "I18nPlugin/Translation/localize-manifests";
            const timingStart = jest.fn();
            const timingEnd = jest.fn();
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                timing: {
                    start: timingStart,
                    end: timingEnd,
                },
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });

            // Act
            plugin.localizeManifests({assets, hashMap});

            // Assert
            expect(timingStart).toHaveBeenCalledWith(timingName);
            expect(timingEnd).toHaveBeenCalledWith(timingName);
        });
    });

    describe("onEmit", () => {
        it("processes all the necessary steps", async () => {
            // Arrange
            const assets = {};
            const translatedStrings = {translatedStrings: true};
            const hashMap = {hashMap: true};
            const locales = ["es", "pt"];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });
            // $FlowIgnore This is a mock.
            plugin.getTranslatedStrings = jest
                .fn()
                .mockReturnValue(translatedStrings);
            // $FlowIgnore This is a mock.
            plugin.translateAssets = jest.fn().mockReturnValue(hashMap);
            // $FlowIgnore This is a mock.
            plugin.localizeManifests = jest.fn();
            const callback = jest.fn();

            // Act
            await plugin.onEmit({assets}, callback);

            // Assert
            // $FlowIgnore This is a mock.
            expect(plugin.getTranslatedStrings).toHaveBeenCalledWith(locales);
            // $FlowIgnore This is a mock.
            expect(plugin.translateAssets).toHaveBeenCalledWith({
                assets,
                translatedStrings,
                localizeRuntimeFiles: false,
            });
            // $FlowIgnore This is a mock.
            expect(plugin.translateAssets).toHaveBeenCalledWith({
                assets,
                translatedStrings,
                hashMap,
                localizeRuntimeFiles: true,
            });
            // $FlowIgnore This is a mock.
            expect(plugin.localizeManifests).toHaveBeenCalledWith({
                assets,
                hashMap,
            });
            expect(callback).toHaveBeenCalled();
        });

        it("skips all the steps when there are no valid locales", async () => {
            // Arrange
            const assets = {};
            const translatedStrings = {translatedStrings: true};
            const hashMap = {hashMap: true};
            const locales = [];
            const plugin = new I18nPlugin({
                locales,
                silent: true,
                getI18nStrings: jest.fn().mockResolvedValue({}),
            });
            // $FlowIgnore This is a mock.
            plugin.getTranslatedStrings = jest
                .fn()
                .mockReturnValue(translatedStrings);
            // $FlowIgnore This is a mock.
            plugin.translateAssets = jest.fn().mockReturnValue(hashMap);
            // $FlowIgnore This is a mock.
            plugin.localizeManifests = jest.fn();
            const callback = jest.fn();

            // Act
            await plugin.onEmit({assets}, callback);

            // Assert
            // $FlowIgnore This is a mock.
            expect(plugin.getTranslatedStrings).not.toHaveBeenCalled();
            // $FlowIgnore This is a mock.
            expect(plugin.translateAssets).not.toHaveBeenCalled();
            // $FlowIgnore This is a mock.
            expect(plugin.localizeManifests).not.toHaveBeenCalled();
            expect(callback).toHaveBeenCalled();
        });
    });
});
