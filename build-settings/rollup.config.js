/* eslint-disable import/no-commonjs */
import fs from "fs";
import autoExternal from "rollup-plugin-auto-external";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

const {presets, plugins} = require("./babel.config.js");

/**
 * Creates the rollup config shared by all our output formats.
 */
const createSharedConfig = (pkgName) => ({
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

        // This generates the flow import file.
        // The copyOnce ensures that we just get one copy of the requested
        // target file, so it's ok that we duplicate this step in our two
        // outputs.
        copy({
            copyOnce: true,
            verbose: true,
            targets: [
                {
                    // src path is relative to the package root unless started
                    // with ./
                    src: "build-settings/index.flow.js.template",
                    // dest path is relative to src path.
                    dest: `packages/${pkgName}/dist`,
                    rename: "index.flow.js",
                },
            ],
        }),
    ],
});

/**
 * For a given package, generate the outputs we want.
 * - CommonJS
 * - ES6
 *
 * https://redfin.engineering/node-modules-at-war-why-commonjs-and-es-modules-cant-get-along-9617135eeca1
 * Per the above blog, we could possibly do better for our consumers by making
 * the ES6 output wrap the CJS output so folks can't accidentally have code
 * including two full copies of the same code somehow, but then that wouldn't
 * have the benefits of ES6 like tree shaking. In reality, the CJS output is
 * likely only used by Jest anyway. We could force consumers to use Babel around
 * their imports so that Jest mocking is supported, but that feels mean and
 * messy.
 */
const createConfig = (pkgName) => {
    const sharedConfig = createSharedConfig(pkgName);
    return [
        {
            output: {
                file: `packages/${pkgName}/dist/index.js`,
                sourcemap: true,
                format: "cjs",
            },
            ...sharedConfig,
        },
        {
            output: {
                file: `packages/${pkgName}/dist/es/index.js`,
                sourcemap: true,
                format: "esm",
            },
            ...sharedConfig,
        },
    ];
};

// For each package in our packages folder, generate the outputs we want.
export default fs.readdirSync("packages").flatMap(createConfig);
