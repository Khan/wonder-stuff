/* eslint-disable import/no-commonjs */
const OFF = "off";
const WARN = "warn";
const ERROR = "error";

module.exports = {
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint", "jsx-a11y", "prettier", "react"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "prettier",
        "plugin:@typescript-eslint/recommended",
    ],
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
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
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
        "no-unused-vars": OFF, // Superseded by @typescript-eslint/no-unused-vars
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
        "prettier/prettier": [ERROR, require("./.prettierrc")],

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

        /**
         * typescript rules
         */

        // Disallow the `any` type.
        //
        // We've disabled this rule because most repos have too many uses of `any`
        // for this to be useful.  Individual repos can enable this rule if they're
        // in a position to do so.
        //
        // Docs: https://typescript-eslint.io/rules/no-explicit-any
        "@typescript-eslint/no-explicit-any": OFF,

        "@typescript-eslint/no-unused-vars": [
            ERROR,
            {args: "none", varsIgnorePattern: "^_*$"},
        ],

        // Require each enum member value to be explicitly initialized.
        //
        // By default enums are assigned integer values starting with 0
        // and ascending.  This can cause issue when removing or inserting
        // new members in the enum since this can change their values.
        // Requiring members to be explicitly initialized prevents this issue.
        //
        // Docs: https://typescript-eslint.io/rules/prefer-enum-initializers
        "@typescript-eslint/prefer-enum-initializers": ERROR,

        // Require all enum members to be literal values.
        //
        // Non-literal values can make it hard to tell what the value of a
        // enum member is.
        //
        // Docs: https://typescript-eslint.io/rules/prefer-literal-enum-member
        "@typescript-eslint/prefer-literal-enum-member": ERROR,
    },
};
