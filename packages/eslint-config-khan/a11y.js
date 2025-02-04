/* eslint-disable import/no-commonjs */
const ERROR = "error";

module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@khanacademy"],
    env: {
        browser: true,
        es6: true,
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
    },
    rules: {
        "@khanacademy/aphrodite-add-style-variable-name": ERROR,
    },
};
