/* eslint-disable import/no-commonjs */
const createBabelPresets = require("./create-babel-presets");

// This config is used for Jest testing here in this repository, only.
module.exports = {
    assumptions: {
        constantReexports: true,
    },
    presets: createBabelPresets({
        platform: "node",
        format: "cjs",
    }),
};
