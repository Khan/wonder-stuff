/* eslint-disable import/no-commonjs */
const createBabelPresets = require("./create-babel-presets.js");

// This config is used for Jest testing here in this repository, only.
module.exports = {
    presets: createBabelPresets({
        platform: "node",
        format: "cjs",
    }),
};
