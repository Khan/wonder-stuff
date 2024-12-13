module.exports = {
    root: true,
    plugins: ["@khanacademy"],
    parser: "@typescript-eslint/parser",
    rules: {
        "@khanacademy/jest-await-async-matchers": [
            "error",
            {
                matchers: [
                    "toHaveMarkedConversion",
                    "toHavePublishedAnalyticsEvent",
                    "toHaveNoA11yViolations",
                ],
            },
        ],
        "@khanacademy/react-no-method-jsx-attribute": "error",
        "@khanacademy/react-svg-path-precision": "error",
        "@khanacademy/sync-tag": [
            // We turn this off when in a Github Actions as we run checksync
            // as a separate process.
            process.env.CI === "true" ? "off" : "error",
            {
                rootDir: __dirname,
            },
        ],
        "@khanacademy/aphrodite-add-style-variable-name": "error",
    },
};
