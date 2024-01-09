/* eslint-disable import/no-commonjs */
// NOTE(kevinb): This should only be used by eslint-plugin-khan
module.exports = {
    presets: [
        [
            "@babel/preset-env",
            {
                targets: {
                    node: true,
                },
            },
        ],
        "@babel/preset-react",
    ],
};
