/* eslint-disable import/no-commonjs */
const OFF = "off";
const WARN = "warn";
const ERROR = "error";

module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@khanacademy"],
    env: {
        // TODO(csilvers): once we properly use node.js for node
        // files, get rid of this next line.
        node: true,
        browser: true,
        es6: true,
        jest: true,
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
    rules: {},
};
