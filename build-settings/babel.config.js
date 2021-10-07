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
                            node: true,
                        },
                    },
                ],
            ],
        },
    },
};
