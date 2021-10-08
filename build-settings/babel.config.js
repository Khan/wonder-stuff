/* eslint-disable import/no-commonjs */
module.exports = {
    presets: ["@babel/preset-flow", "@babel/preset-env"],
    env: {
        test: {
            presets: [
                "@babel/preset-flow",
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            // Our currently minimum support is node 12
                            // TODO: We'll want to change this based on the
                            // package being created since some will want
                            // to support node and browser, or just node.
                            node: 12,
                        },
                    },
                ],
            ],
        },
    },
};
