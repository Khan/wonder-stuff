/* eslint-disable import/no-commonjs */
const ERROR = "error";

module.exports = {
    parser: "@typescript-eslint/parser",
    extends: ["plugin:jsx-a11y/strict"],
    plugins: ["@khanacademy", "jsx-a11y"],
    env: {
        browser: true,
        es6: true,
    },
    settings: {
        react: {
            version: "detect",
        },
        "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
        },
        "import/extensions": [".js", ".jsx", ".ts", ".tsx"],
        "jsx-a11y": {
            polymorphicPropName: "tag",
            components: {
                Link: "a",
                Button: "button",
                IconButton: "button",
                Textarea: "textarea",
                TextField: "input",

                // Mapping for common wrappers for html elements when we can use `addStyle`
                StyledA: "a",
                StyledButton: "button",
                StyledImg: "img",
                StyledSvg: "svg",
                StyledUl: "ul",
                StyledOl: "ol",
                StyledLi: "li",
                StyledSpan: "span",
                StyledDiv: "div",
                StyledSection: "section",
                StyledHeader: "header",
                StyledFooter: "footer",
                StyledBlockquote: "blockquote",
                StyledForm: "form",
                StyledOutput: "output",
                StyledIframe: "iframe",
                StyledHr: "hr",
                StyledP: "p",
                StyledFieldset: "fieldset",
                StyledLegend: "legend",
                StyledCaption: "caption",
                StyledPre: "pre",
                StyledSup: "sup",
                StyledMark: "mark",
                StyledTable: "table",
                StyledTr: "tr",
                StyledTd: "td",
                StyledTh: "th",
                StyledDl: "dl",
                StyledDt: "dt",
                StyledDd: "dd",
            },
            attributes: {
                for: ["htmlFor", "for"],
            },
        },
    },
    rules: {
        "@khanacademy/aphrodite-add-style-variable-name": ERROR,

        // jsx-a11y
        // Explicitly enable accessible emoji rule so that emojis are used intentionally.
        // Note: The plugin marks this rule as deprecated since browsers and assistive
        // tech have advanced since the rule was introduced.
        "jsx-a11y/accessible-emoji": "error",
        // Disabled since using autofocus could be valid depending on the context
        "jsx-a11y/no-autofocus": "off",
        // Disabled since setting role is sometimes valid, especially on flexible
        // custom components
        "jsx-a11y/prefer-tag-over-role": "off",
        // Disabled because results from rule are not reliable. Would be more
        // helpful to check associated labels on rendered output
        "jsx-a11y/control-has-associated-label": "off",
        "jsx-a11y/lang": "error",
        "jsx-a11y/no-aria-hidden-on-focusable": "error",
        "jsx-a11y/anchor-ambiguous-text": "error",
        "jsx-a11y/anchor-is-valid": [
            "error",
            // This makes it so Link components using the `to` prop is valid
            // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/issues/340#issuecomment-338424908
            {components: ["Link"], specialLink: ["to"]},
        ],
        "jsx-a11y/no-noninteractive-tabindex": [
            "error",
            // It is recommended to allow this rule on elements with role=tabpanel
            // https://github.com/jsx-eslint/eslint-plugin-jsx-a11y/blob/e5dda96f9c021c524a05d9b6b209a2389828ffb3/docs/rules/no-noninteractive-tabindex.md#rule-options
            {
                tags: [],
                roles: ["tabpanel"],
            },
        ],
        "jsx-a11y/label-has-associated-control": [
            "error",
            {
                // Increase depth to support cases where there are nested elements within a label
                depth: 3,
            },
        ],
    },
};
