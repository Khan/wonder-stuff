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

const createConfig = ({name, format, platform, file, plugins}) => {
    const config = {
        output: createOutputConfig(name, format, file),
        input: makePackageBasedPath(name, "./src/index.js"),
        plugins: [
            replace({
                preventAssignment: true,
                values: {
                    "process.env.NODE_ENV": JSON.stringify(
                        process.env.NODE_ENV || "production",
                    ),
                    __IS_BROWSER__: platform === "browser",
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
            ...plugins,
        ],
    };

    return config;
};

// For each package in our packages folder, generate the outputs we want.
// To determine what those outputs are, we read the package.json file for
// each package. If the package has a `browser` field, then we generate
// browser and node assets. If not, we just generate the node assets.
// Note that we also get the output paths from the package.json.
const getPackageInfo = (pkgName) => {
    const pkgJsonPath = makePackageBasedPath(pkgName, "./package.json");
    if (!fs.existsSync(pkgJsonPath)) {
        return [];
    }
    const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath));

    // Now we have the package.json, we need to look at the main, module, and
    // browser fields and values.
    const {main: cjsNode, module: esmNode, browser} = pkgJson;
    const cjsBrowser = browser == null ? undefined : browser[cjsNode];
    const esmBrowser = browser == null ? undefined : browser[esmNode];

    // This generates the flow import file and a file for intellisense to work.
    // By using the same instance of it across all output configurations
    // while using the `copyOnce` value, we ensure it only gets copied one time.
    const typesAndDocsCopy = copy({
        copyOnce: true,
        verbose: true,
        targets: [
            {
                // src path is relative to the package root unless started
                // with ./
                src: "build-settings/index.js.flow.template",
                // dest path is relative to src path.
                dest: makePackageBasedPath(pkgName, "./dist"),
                rename: "index.js.flow",
            },
            {
                // src path is relative to the package root unless started
                // with ./
                src: "build-settings/index.js.flow.template",
                // dest path is relative to src path.
                dest: makePackageBasedPath(pkgName, "./dist"),
                rename: "index.d.ts",
            },
        ],
    });
    return [
        {
            name: pkgName,
            format: "esm",
            platform: "node",
            file: esmNode,
            plugins: [typesAndDocsCopy],
        },
        {
            name: pkgName,
            format: "esm",
            platform: "browser",
            file: esmBrowser,
            plugins: [typesAndDocsCopy],
        },
        {
            name: pkgName,
            format: "cjs",
            platform: "node",
            file: cjsNode,
            plugins: [typesAndDocsCopy],
        },
        {
            name: pkgName,
            format: "cjs",
            platform: "browser",
            file: cjsBrowser,
            plugins: [typesAndDocsCopy],
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

    // Get the list of packages that we have in our packages folder.
    const actualPackages = fs.readdirSync("packages");

    // Parse the configPackages arg into an array of package names.
    const specificPackages =
        configPackages && configPackages.length
            ? configPackages.split(",").map((p) => p.trim())
            : null;

    // Filter our list of actual packages to only those that were requested.
    const pkgNames = actualPackages.filter(
        (p) => !specificPackages || specificPackages.some((s) => p.endsWith(s)),
    );

    if (
        specificPackages != null &&
        specificPackages.length !== pkgNames.length
    ) {
        // If we were asked for specific packages but we did not match them
        // all, then let's tell the caller which ones we couldn't find.
        const missingPackages = specificPackages.filter(
            (s) => !pkgNames.some((p) => p.endsWith(s)),
        );
        throw new Error(
            `Could not find one or more of the requested packages: ${missingPackages}`,
        );
    } else if (pkgNames.length === 0) {
        // If we just don't have any packages right now, let's also report that.
        throw new Error("No packages found in /packages folder");
    }

    // For the packages we have determined we want, let's get more information
    // about them and  generate configurations.
    return pkgNames.flatMap(getPackageInfo).map((c) => createConfig(c));
};

// eslint-disable-next-line import/no-default-export
export default createRollupConfig;
