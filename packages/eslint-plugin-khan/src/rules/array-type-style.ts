import {ESLintUtils} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = [];
type MessageIds = "errorString";

const message =
    "Shorthand syntax for array types can appear ambiguous.  " +
    "Please use the long-form: Array<>";

export default createRule<Options, MessageIds>({
    name: "array-type-style",
    meta: {
        docs: {
            description: "Prefer Array<T> to T[]",
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
            TSArrayType(node) {
                context.report({
                    fix(fixer) {
                        const type = node.elementType;
                        const typeText = sourceCode.text.slice(...type.range);
                        const replacementText = `Array<${typeText}>`;

                        return fixer.replaceText(node, replacementText);
                    },
                    node: node,
                    messageId: "errorString",
                });
            },
        };
    },
    defaultOptions: [],
});
