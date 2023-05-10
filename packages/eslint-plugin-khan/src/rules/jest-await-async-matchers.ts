import {ESLintUtils, TSESTree, AST_NODE_TYPES} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

const getPropertyNames = (node: TSESTree.Node | undefined): Array<string> => {
    if (node?.type !== AST_NODE_TYPES.MemberExpression) {
        return [];
    }
    if (node.property.type === AST_NODE_TYPES.Identifier) {
        return [node.property.name, ...getPropertyNames(node.parent)];
    }
    return [];
};

const findParentCallExpression = (
    node: TSESTree.Node | undefined,
): TSESTree.Node | null => {
    if (node?.type === AST_NODE_TYPES.Program) {
        return null;
    }
    if (node?.parent?.type === AST_NODE_TYPES.CallExpression) {
        return node.parent;
    }
    return findParentCallExpression(node?.parent);
};

const intersect = (
    array1: Array<string>,
    array2: Array<string>,
): Array<string> => {
    return array1.filter((value) => array2.includes(value));
};

const getCustomMatchers = (options: Options) => {
    if (options && options[0] && options[0].matchers) {
        return options[0].matchers;
    }
    return [];
};

const DEFAULT_MATCHERS = [
    // built into jest
    "resolves",
    "rejects",
    // from of jest-extended
    "toResolve",
    "toReject",
];

type Options = [{matchers: Array<string>}];
type MessageIds = "asyncMatchers";

export default createRule<Options, MessageIds>({
    name: "jest-await-async-matchers",
    meta: {
        docs: {
            description: "",
            recommended: false,
        },
        messages: {
            asyncMatchers: "Assertions using `{{matchers}}` should be awaited.",
        },
        fixable: "code",
        schema: [
            {
                type: "object",
                properties: {
                    matchers: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                },
                additionalProperties: false,
            },
        ],
        type: "problem",
    },

    create(context) {
        const customMatchers = getCustomMatchers(context.options);
        const allowedMatchers = [...DEFAULT_MATCHERS, ...customMatchers];

        return {
            CallExpression(node) {
                // We only run this check on expect() calls.
                if (
                    !(
                        node.callee.type === AST_NODE_TYPES.Identifier &&
                        node.callee.name === "expect"
                    )
                ) {
                    return;
                }
                if (node.parent?.type !== AST_NODE_TYPES.MemberExpression) {
                    return;
                }
                // While someone could use an indexer to access matchers,
                // that never happens in practice so we don't bother handling
                // this edge case.
                if (node.parent.property.type !== AST_NODE_TYPES.Identifier) {
                    return;
                }

                // Gets all the properties in a jest assertion, e.g.
                // expect(foo).not.toEqual(bar) would result in the
                // following property names: ["not", "toEqual"].
                const propertyNames = getPropertyNames(node.parent);

                // This should only contain a single entry when there's a match
                const matchers = intersect(propertyNames, allowedMatchers);
                if (matchers.length === 0) {
                    return;
                }

                // This is the matcher call itself, e.g. .toBe(true)
                const parentCallExpression = findParentCallExpression(node);
                if (!parentCallExpression) {
                    return;
                }

                if (
                    parentCallExpression?.parent?.type !==
                    AST_NODE_TYPES.AwaitExpression
                ) {
                    context.report({
                        node: parentCallExpression,
                        messageId: "asyncMatchers",
                        data: {matchers: matchers},
                        fix(fixer) {
                            return fixer.insertTextBefore(
                                parentCallExpression,
                                "await ",
                            );
                        },
                    });
                }
            },
        };
    },
    defaultOptions: [{matchers: []}],
});
