/* eslint-disable import/no-commonjs */
import fs from "fs";
import path from "path";
import autoExternal from "rollup-plugin-auto-external";
import {babel} from "@rollup/plugin-babel";
import {terser} from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";

const createBabelPresets = require("./create-babel-presets.js");

/**
 * Make path to a package relative path.
 */
const makePackageBasedPath = (pkgName, pkgRelPath) =>
    path.normalize(path.join("packages", pkgName, pkgRelPath));

/**
 * Generate the rollup output configuration for a given
 */
const createOutputConfig = (pkgName, format, targetFile) => ({
    file: makePackageBasedPath(pkgName, targetFile),
    sourcemap: true,
    format,
});

const createConfig = ({name, format, platform, file}) => ({
    output: createOutputConfig(name, format, file),
    input: makePackageBasedPath(name, "./src/index.js"),
    plugins: [
        replace({
            preventAssignment: true,
            values: {
                "process.env.NODE_ENV": JSON.stringify(
                    process.env.NODE_ENV || "production",
                ),
            },
        }),
        babel({
            babelHelpers: "bundled",
            presets: createBabelPresets({platform, format}),
            exclude: "node_modules/**",
        }),
        resolve({
            browser: platform === "browser",
        }),
        autoExternal({
            packagePath: makePackageBasedPath(name, "./package.json"),
        }),
        terser(),

        // This generates the flow import file.
        copy({
            copyOnce: true,
            verbose: true,
            targets: [
                {
                    // src path is relative to the package root unless started
                    // with ./
                    src: "build-settings/index.flow.js.template",
                    // dest path is relative to src path.
                    dest: makePackageBasedPath(name, "./dist"),
                    rename: "index.flow.js",
                },
            ],
        }),
    ],
});

// For each package in our packages folder, generate the outputs we want.
// To determine what those outputs are, we read the package.json file for
// each package. If the package has a `browser` field, then we generate
// browser and node assets. If not, we just generate the node assets.
// Note that we also get the output paths from the package.json.
const getPackageInfo = (pkgName) => {
    const pkgJsonPath = makePackageBasedPath(pkgName, "./package.json");
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));

    // Now we have the package.json, we need to look at the main, module, and
    // browser fields and values.
    const {main: cjsNode, module: esmNode, browser} = pkgJson;
    const cjsBrowser = browser == null ? undefined : browser[cjsNode];
    const esmBrowser = browser == null ? undefined : browser[esmNode];

    return [
        {
            name: pkgName,
            format: "esm",
            platform: "node",
            file: esmNode,
        },
        {
            name: pkgName,
            format: "esm",
            platform: "browser",
            file: esmBrowser,
        },
        {
            name: pkgName,
            format: "cjs",
            platform: "node",
            file: cjsNode,
        },
        {
            name: pkgName,
            format: "cjs",
            platform: "browser",
            file: cjsBrowser,
        },
    ].filter((i) => !!i.file);
};

/**
 * Creates the full rollup configuration for the given args.
 *
 * If the `configPackages` arg is included, we split it on commas and
 * take each as the name of a package to process. Otherwise, we process all
 * packages.
 */
const createRollupConfig = (commandLineArgs) => {
    const {configPackages} = commandLineArgs;
    const pkgNames =
        configPackages && configPackages.length
            ? configPackages
                  .split(",")
                  .map((s) =>
                      s.startsWith("wonder-stuff") ? s : `wonder-stuff-${s}`,
                  )
            : fs.readdirSync("packages");

    return pkgNames.flatMap(getPackageInfo).map(createConfig);
};

export default createRollupConfig;
