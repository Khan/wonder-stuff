const globSync = require("fast-glob").globSync;

/** @type {Partial<import("typedoc").TypeDocOptions>} */
const config = {
    entryPoints: globSync("packages/*/src/index.ts"),
    out: "docs",
};

module.exports = config;
