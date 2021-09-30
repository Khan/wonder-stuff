/* eslint-disable import/no-commonjs */
import fs from "fs";
import autoExternal from "rollup-plugin-auto-external";
import babel from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";

const {presets, plugins} = require("./babel.config.js");

const createConfig = (pkgName) => ({
    output: {
        file: `packages/${pkgName}/dist/index.js`,
        format: "esm",
    },
    input: `packages/${pkgName}/src/index.js`,
    plugins: [
        babel({
            babelHelpers: "bundled",
            presets,
            plugins,
            exclude: "node_modules/**",
        }),
        autoExternal({
            packagePath: `packages/${pkgName}/package.json`,
        }),
        terser(),
    ],
});

export default fs.readdirSync("packages").map(createConfig);
