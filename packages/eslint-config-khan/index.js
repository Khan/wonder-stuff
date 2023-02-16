/* eslint-disable import/no-commonjs */
const OFF = "off";
const WARN = "warn";
const ERROR = "error";

module.exports = {
    parser: "babel-eslint",
    plugins: ["jsx-a11y", "prettier", "react"],
    extends: ["eslint:recommended", "prettier"],
    env: {
        // TODO(csilvers): once we properly use node.js for node
        // files, get rid of this next line.
        node: true,
        browser: true,
        es6: true,
        jest: true,
    },
    settings: {
        react: {
            version: "16.4",
        },
    },
    rules: {
        /**
         * built-in rules
         */
        "arrow-parens": OFF, // We've decided explicitly not to care about this.
        "constructor-super": ERROR,
        camelcase: [
            ERROR,
            {
                properties: "never", // We'd possibly like to remove the 'properties': 'never' one day.
                allow: ["^UNSAFE_"],
            },
        ],
        curly: ERROR,
        eqeqeq: [ERROR, "allow-null"],
        "guard-for-in": ERROR,
        "linebreak-style": [ERROR, "unix"],
        "max-lines": [ERROR, 1000],
        "no-alert": ERROR,
        "no-array-constructor": ERROR,
        "no-case-declarations": OFF, // TODO(kevinb): Enable this.
        "no-console": ERROR,
        "no-const-assign": ERROR,
        "no-debugger": ERROR,
        "no-dupe-class-members": ERROR,
        "no-dupe-keys": ERROR,
        "no-extra-bind": ERROR,
        "no-new-func": ERROR,
        "no-new-object": ERROR,
        "no-new": ERROR,
        "no-this-before-super": ERROR,
        "no-throw-literal": ERROR,
        "no-undef": ERROR,
        "no-unexpected-multiline": ERROR,
        "no-unreachable": ERROR,
        "no-unused-expressions": ERROR,
        "no-unused-vars": [ERROR, {args: "none", varsIgnorePattern: "^_*$"}],
        "no-useless-call": ERROR,
        "no-var": ERROR,
        "no-with": ERROR,
        "one-var": [ERROR, "never"],
        "prefer-arrow-callback": OFF, // TODO(kevinb): enable this and then disable it in webapp
        "prefer-const": ERROR,
        "prefer-spread": ERROR,
        "prefer-template": OFF, // It complains about multi-line strings which is going too far.
        "require-jsdoc": OFF, // Adding jsdocs to everything is overly burdensome.
        "template-curly-spacing": OFF, // TODO(kevinb): enable this
        "valid-jsdoc": OFF, // TODO(kevinb): Enable this since we are using jdocs in some places.

        /**
         * jsx-a11y rules
         */
        "jsx-a11y/alt-text": ERROR,
        "jsx-a11y/aria-props": ERROR,
        "jsx-a11y/aria-role": [ERROR, {ignoreNonDOM: true}],
        "jsx-a11y/anchor-is-valid": ERROR,

        /**
         * prettier rules
         */
        "prettier/prettier": ["error", require("./.prettierrc")],

        /**
         * react rules
         */
        "react/forbid-prop-types": [ERROR, {forbid: ["array", "object"]}],
        "react/jsx-no-duplicate-props": ERROR,
        "react/jsx-no-undef": ERROR,
        "react/jsx-sort-props": OFF, // Too little benefit, especially when all props are on the same line.
        "react/jsx-uses-react": ERROR,
        "react/jsx-uses-vars": ERROR,
        "react/no-did-mount-set-state": [ERROR],
        "react/no-did-update-set-state": ERROR,
        "react/no-direct-mutation-state": ERROR,
        "react/prop-types": ERROR,
        "react/self-closing-comp": ERROR,
        "react/sort-comp": [
            ERROR,
            {
                // TODO(kevinb): Specify where "constructor" should go.
                order: [
                    "type-annotations",
                    "static-methods",
                    "lifecycle",
                    "everything-else",
                    "render",
                ],
            },
        ],
        "react/sort-prop-types": OFF, // We tried this, but there wasn't much benefit.
        "react/no-unsafe": WARN,
        "react/no-deprecated": WARN,
    },
};
