/* eslint-disable import/no-commonjs */
const babelJest = require("babel-jest").default;

const babelConfig = require("../../build-settings/babel.config");

module.exports = babelJest.createTransformer(babelConfig);
