/* eslint-disable import/no-commonjs */
module.exports = function createBabelPresets({platform, format}) {
    const targets = {};
    if (platform === "node") {
        targets.node = true;
    }
    if (format === "esm") {
        targets.esmodules = true;
    }
    return [
        "@babel/preset-flow",
        [
            "@babel/preset-env",
            {
                targets,
            },
        ],
    ];
};
