/* eslint-disable import/no-commonjs */
/**
 * This is the main jest config.  It runs tests using the default
 * test environment: jest-environment-node.
 */
const path = require("path");

module.exports = {
    rootDir: path.join(__dirname, "../../"),
    transform: {
        "^.+\\.(j|t)sx?$": "<rootDir>/config/jest/test.transform.js",
    },
    restoreMocks: true,
    resetMocks: true,
    testEnvironment: "jest-environment-node",
    testMatch: ["<rootDir>/**/*.test.ts"],
    setupFilesAfterEnv: [
        "jest-extended/all",
        "<rootDir>/config/jest/test-setup.js",
    ],
    moduleNameMapper: {
        "^@khanacademy/wonder-stuff-(.*)$":
            "<rootDir>/packages/wonder-stuff-$1/src/index.ts",
    },
    collectCoverageFrom: [
        "packages/**/*.ts",
        "!packages/**/types.ts",
        "!packages/**/src/**/index.ts",
        "!packages/**/*.flowtest.ts",
        "!packages/**/dist/**/*.ts",
        "!<rootDir>/node_modules/",
        "!packages/**/node_modules/",
        "!packages/**/.babelrc.js",
        "!packages/eslint-config-khan/**",
    ],
    // Only output log messages on test failure. From:
    // https://github.com/facebook/jest/issues/4156#issuecomment-490764080
    reporters: ["<rootDir>/config/jest/log-on-fail-reporter.js"],
};
