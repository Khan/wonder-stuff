import {ESLintUtils, TSESTree, AST_NODE_TYPES} from "@typescript-eslint/utils";

import * as t from "../ast-utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

const messages = {
    errorMessage: "This path contains numbers with too many decimal places.",
};

type MessageIds = keyof typeof messages;
type Options = [
    {
        precision: number;
    },
];

export default createRule<Options, MessageIds>({
    name: "react-svg-path-precision",
    meta: {
        docs: {
            description:
                "Ensure that SVG paths don't use too many decimal places",
            recommended: false,
        },
        fixable: "code",
        messages,
        schema: [
            {
                type: "object",
                properties: {
                    precision: {
                        type: "number",
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "problem",
    },

    create(context, [{precision}]) {
        const pattern = `\\d*\\.\\d{${precision},}\\d+`;
        const regex = new RegExp(pattern, "g");

        return {
            JSXAttribute(node) {
                if (
                    t.isJSXAttribute(node) &&
                    t.isJSXIdentifier(node.name, {name: "d"})
                ) {
                    if (
                        t.isJSXOpeningElement(node.parent) &&
                        t.isJSXIdentifier(node.parent.name, {name: "path"}) &&
                        t.isLiteral(node.value)
                    ) {
                        const nodeValue = node.value;
                        const d = nodeValue.value as string;

                        if (regex.test(d)) {
                            context.report({
                                fix(fixer) {
                                    const replacementText = d.replace(
                                        regex,
                                        (match) =>
                                            parseFloat(match).toFixed(
                                                precision,
                                            ),
                                    );

                                    return fixer.replaceText(
                                        nodeValue,
                                        `"${replacementText}"`,
                                    );
                                },
                                node,
                                messageId: "errorMessage",
                            });
                        }
                    }
                }
            },
        };
    },
    defaultOptions: [{precision: 2}],
});
