import {ESLintUtils} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = ["always" | "never"];
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
        schema: [{enum: ["always", "never"]}],
        type: "problem",
    },

    create(context) {
        const configuration = context.options[0] || "never";
        const sourceCode = context.getSourceCode();

        return {
            TSTupleType(node) {
                if (
                    configuration === "always" &&
                    node.elementTypes.length === 1
                ) {
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
    defaultOptions: ["always"],
});
