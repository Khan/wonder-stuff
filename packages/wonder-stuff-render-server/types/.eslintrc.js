/* eslint-disable import/no-commonjs */
module.exports = {
    extends: ["../.eslintrc.js"],
    rules: {
        "import/no-unassigned-import": [
            "error",
            {
                allow: ["superagent"],
            },
        ],
    },
};
