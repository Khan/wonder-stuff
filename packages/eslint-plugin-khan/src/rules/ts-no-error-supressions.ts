import {ESLintUtils, TSESTree} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = ["always" | "never"];
type MessageIds = "errorString";

const message = "{{type}} not allowed on JSXAttributes";

export default createRule<Options, MessageIds>({
    name: "ts-no-error-suppressions",
    meta: {
        docs: {
            description:
                "Disallow @ts-expect-error and @ts-ignore certain node types",
            recommended: false,
        },
        fixable: "code",
        messages: {
            errorString: message,
        },
        schema: [{enum: ["always", "never"]}],
        type: "problem",
    },

    create(context, [mode]) {
        if (mode === "never") {
            return {};
        }

        let tsComments: Array<TSESTree.Comment>;

        return {
            Program(node) {
                tsComments = (node.comments ?? []).filter((comment) => {
                    return comment.value.trim().startsWith("@ts-");
                });
            },
            JSXOpeningElement(node) {
                for (const comment of tsComments) {
                    if (
                        node.range[0] < comment.range[0] &&
                        node.range[1] > comment.range[1]
                    ) {
                        const match = comment.value.match(/@ts-[a-zA-Z-]+/);
                        context.report({
                            node: comment,
                            messageId: "errorString",
                            data: {
                                type: match ?? "TypeScript error suppression",
                            },
                        });
                    }
                }
            },
        };
    },
    defaultOptions: ["always"],
});
