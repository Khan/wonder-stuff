import {ESLintUtils} from "@typescript-eslint/utils";

import type {MyPluginDocs} from "../types";

const createRule = ESLintUtils.RuleCreator<MyPluginDocs>(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = [];
type MessageIds = "errorString";

const message =
    "One-tuples can be confused with shorthand syntax for array types.  " +
    "Using Array<> avoids this confusion.";

export default createRule<Options, MessageIds>({
    name: "no-one-tuple",
    meta: {
        docs: {
            description: "Disallow one-tuple",
            recommended: false,
        },
        fixable: "code",
        messages: {
            errorString: message,
        },
        schema: [],
        type: "problem",
    },

    create(context) {
        const sourceCode = context.getSourceCode();

        return {
            TSTupleType(node) {
                if (node.elementTypes.length === 1) {
                    context.report({
                        fix(fixer) {
                            const type = node.elementTypes[0];
                            const typeText = sourceCode.text.slice(
                                ...type.range,
                            );
                            const replacementText = `Array<${typeText}>`;

                            return fixer.replaceText(node, replacementText);
                        },
                        node: node,
                        messageId: "errorString",
                    });
                }
            },
        };
    },
    defaultOptions: [],
});
