const {rules} = require("../lib/index.js");
const util = require("../lib/util.js");
const RuleTester = require("eslint").RuleTester;

const parserOptions = {
    parser: "babel-eslint",
};

const ruleTester = new RuleTester(parserOptions);
const rule = rules["sync-tag"];

util.execSync = command => {
    console.log("execSync mock --------");
    if (command.includes("filea")) {
        const json = JSON.stringify({
            version: "2.2.3",
            launchString: "",
            items: [],
        });
        return json;
    }
    if (command.includes("filex")) {
        return JSON.stringify({
            version: "2.2.3",
            launchString: "",
            items: [
                {
                    type: "violation",
                    sourceFile: "filex",
                    sourceLine: 2,
                    targetFile: "filey",
                    targetLine: 23,
                    message: `filex:15 Updating checksum for sync-tag 'foo-bar' referencing 'filey:23' from No checksum to 1424803960.`,
                    fix: "// sync-start:foo-bar 1424803960 filey",
                },
            ],
        });
    }
    return "";
};

ruleTester.run("require-static-url", rule, {
    valid: [
        {
            code:
                "// sync-start:foo-bar 1424803960 fileb\nconst FooBar = 'foobar';\n// sync-end:foobar",
            filename: "filea",
            options: [
                {
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
                // sync-end:foobar`,
            filename: "filex",
            errors: [
                "filex:15 Updating checksum for sync-tag 'foo-bar' referencing 'filey:23' from No checksum to 1424803960. " +
                    "If necessary, check the sync-tag target and make relevant changes before updating the checksum.",
            ],
            output: `
                // sync-start:foo-bar 1424803960 filey
                const FooBar = 'foobar';
                // sync-end:foobar`,
            options: [
                {
                    ignoreFiles: ["lint_blacklist.txt"],
                    rootDir: "/Users/nyancat/project",
                },
            ],
        },
    ],
});
