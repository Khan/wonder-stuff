import {ESLintUtils, TSESTree} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = ["always" | "never"];
type MessageIds = "errorString";

const message = "{{type}} not allowed on JSXAttributes";

function rangesDoNotIntersect(
    aRange: TSESTree.Range,
    bRange: TSESTree.Range,
): boolean {
    const [aMin, aMax] = aRange;
    const [bMin, bMax] = bRange;

    return aMax < bMin || aMin > bMax;
}

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
                // The parser doesn't attach comments to their closest node and instead
                // leaves them in `Program.comments` at the root of the AST so we need
                // grab them so we can reference them latter when processing JSXOpeningElement.
                // We only grab the comments that start with "@ts-" since those are the
                // only comments we care about.
                tsComments = (node.comments ?? []).filter((comment) => {
                    return comment.value.trim().startsWith("@ts-");
                });
            },
            JSXOpeningElement(node) {
                for (const comment of tsComments) {
                    if (
                        // Because the comments aren't attached to the JSXAttributes,
                        // we need to check if they're inside of the opening block...
                        node.range[0] < comment.range[0] &&
                        node.range[1] > comment.range[1] &&
                        // ...and not intersecting any of the attributes since it's
                        // okay if these comments appear within a JSXAttribute's value
                        // like in side a callback.
                        node.attributes.every((attrNode) =>
                            rangesDoNotIntersect(attrNode.range, comment.range),
                        )
                    ) {
                        const match = comment.value.match(/@ts-[a-zA-Z-]+/);
                        context.report({
                            fix(fixer) {
                                const [start, end] = comment.range;
                                // `end + 1` is so that we remove the carriage return
                                // and the end of the line.
                                return fixer.removeRange([start, end + 1]);
                            },
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
