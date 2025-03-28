import {RuleTester} from "@typescript-eslint/rule-tester";

import {rules} from "../../src/index";
import * as util from "../../src/util";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 6,
            sourceType: "module",
            ecmaFeatures: {},
        },
    },
    linterOptions: {
        // NOTE(kevinb): Avoids 'TypeError: Expected a Boolean' error
        // when running the tests.
        reportUnusedDisableDirectives: true,
    },
});

beforeEach(() => {
    jest.spyOn(util, "execSync").mockImplementation((command) => {
        // eslint-disable-next-line no-console
        console.log("execSync mock --------");
        if (command.includes("filea")) {
            const json = JSON.stringify({
                version: "4.0.0",
                launchString: "",
                files: {},
            });
            return json;
        }
        if (command.includes("filex")) {
            return JSON.stringify({
                version: "4.0.0",
                launchString: "",
                files: {
                    filex: [
                        {
                            reason: "Looks like you changed the target content for sync-tag 'foo-bar' in 'filex:2'. Make sure you've made the parallel changes in the source file, if necessary (12352 != 249234014)",
                            location: {
                                line: 2,
                            },
                            code: "violation",
                            fix: {
                                type: "replace",
                                line: 2,
                                description:
                                    "Updated checksum for sync-tag 'foo-bar' referencing 'filex:2' from 12352 to 249234014.",
                                declaration: "// sync-start:foo-bar filey",
                                text: "// sync-start:foo-bar 1424803960 filey",
                            },
                        },
                    ],
                },
            });
        }
        if (command.includes("file_delete_tag")) {
            return JSON.stringify({
                version: "4.0.0",
                launchString: "",
                files: {
                    file_delete_tag: [
                        {
                            reason: "Duplicate target for sync-tag 'foo-bar'",
                            location: {
                                line: 2,
                            },
                            code: "violation",
                            fix: {
                                type: "delete",
                                line: 3,
                                description:
                                    "Removed duplicate target for sync-tag 'foo-bar'",
                                declaration: "// sync-start:foo-bar filey",
                            },
                        },
                    ],
                },
            });
        }
        if (command.includes("file_unfixable")) {
            return JSON.stringify({
                version: "4.0.0",
                launchString: "",
                files: {
                    file_unfixable: [
                        {
                            reason: "Sync-start for 'foo-bar' points to 'filey', which does not exist or is a directory",
                            location: {
                                line: 2,
                            },
                            code: "file-does-not-exist",
                        },
                    ],
                },
            });
        }
        return "";
    });
});

const ruleName = "sync-tag";
const rule = rules[ruleName];

ruleTester.run("sync-tag", rule, {
    valid: [
        {
            code: "// sync-start:foo-bar 1424803960 fileb\nconst FooBar = 'foobar';\n// sync-end:foo-bar",
            filename: "filea",
            options: [
                {
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
        {
            code: "// sync-start:foo-bar 1424803960 fileb\nconst FooBar = 'foobar';\n// sync-end:foo-bar",
            filename: "filea",
            options: [
                {
                    configFile: "./checksync.json",
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
    ],
    invalid: [
        {
            code: `
                // sync-start:foo-bar filey
                const FooBar = 'foobar';
                // sync-end:foo-bar`,
            filename: "filex",
            errors: [
                {
                    messageId: "reason",
                    data: {
                        reason: "Looks like you changed the target content for sync-tag 'foo-bar' in 'filex:2'. Make sure you've made the parallel changes in the source file, if necessary (12352 != 249234014)",
                    },
                },
            ],
            output: `
                // sync-start:foo-bar 1424803960 filey
                const FooBar = 'foobar';
                // sync-end:foo-bar`,
            options: [
                {
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
        {
            code: `
                // sync-start:foo-bar 1424803960 filey
                // sync-start:foo-bar 1424803960 filey
                const FooBar = 'foobar';
                // sync-end:foo-bar`,
            filename: "file_delete_tag",
            errors: [
                {
                    messageId: "reason",
                    data: {reason: "Duplicate target for sync-tag 'foo-bar'"},
                },
            ],
            // Prettier is removing whitespace within backticks, so I had to add
            // the newlines manually.
            output: `
                // sync-start:foo-bar 1424803960 filey\n                \n                const FooBar = 'foobar';
                // sync-end:foo-bar`,
            options: [
                {
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
        {
            code: `
                // sync-start:foo-bar 1424803960 filey
                const FooBar = 'foobar';
                // sync-end:foo-bar`,
            filename: "file_unfixable",
            errors: [
                {
                    messageId: "reason",
                    data: {
                        reason: "Sync-start for 'foo-bar' points to 'filey', which does not exist or is a directory",
                    },
                },
            ],
            options: [
                {
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
    ],
});
