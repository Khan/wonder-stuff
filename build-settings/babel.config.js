/* eslint-disable import/no-commonjs */
module.exports = {
    presets: ["@babel/preset-flow", "@babel/preset-env"],
    plugins: [
        "@babel/plugin-proposal-class-properties",
    ],
    env: {
        test: {
            presets: [
                "@babel/preset-flow",
                [
                    "@babel/preset-env",
                    {
                        targets: {
                            node: true,
                        },
                    },
                ],
            ],
        },
    },
};
