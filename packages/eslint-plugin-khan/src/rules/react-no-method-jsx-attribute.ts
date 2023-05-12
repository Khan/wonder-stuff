import {ESLintUtils, TSESTree, AST_NODE_TYPES} from "@typescript-eslint/utils";

const createRule = ESLintUtils.RuleCreator(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

const messages = {
    errorMessage:
        "Methods cannot be passed as props, use a class property instead.",
};

type MessageIds = keyof typeof messages;
type Options = [];

export default createRule<Options, MessageIds>({
    name: "react-no-method-jsx-attribute",
    meta: {
        docs: {
            description: "Ensure that methods aren't used as jsx attributes",
            recommended: false,
        },
        messages,
        schema: [],
        type: "problem",
    },

    create(context) {
        const methods = new Map();
        const classProperties = new Map();

        return {
            ClassDeclaration(node) {
                for (const child of node.body.body) {
                    if (
                        child.type === AST_NODE_TYPES.PropertyDefinition &&
                        child.key.type === "Identifier"
                    ) {
                        classProperties.set(child.key.name, child);
                    } else if (
                        child.type === "MethodDefinition" &&
                        child.kind === "method" &&
                        child.key.type === "Identifier"
                    ) {
                        methods.set(child.key.name, child);
                    }
                }
            },
            "ClassDeclaration:exit"(node: TSESTree.ClassDeclaration) {
                for (const child of node.body.body) {
                    if (
                        child.type === AST_NODE_TYPES.PropertyDefinition &&
                        child.key.type === "Identifier"
                    ) {
                        classProperties.delete(child.key.name);
                    } else if (
                        child.type === "MethodDefinition" &&
                        child.kind === "method" &&
                        child.key.type === "Identifier"
                    ) {
                        methods.delete(child.key.name);
                    }
                }
            },
            JSXAttribute(node) {
                const {value} = node;
                // value doesn't exist for boolean shorthand attributes
                if (value && value.type === "JSXExpressionContainer") {
                    const {expression} = value;
                    if (expression.type === "MemberExpression") {
                        const {object, property} = expression;
                        if (
                            object.type === "ThisExpression" &&
                            property.type === "Identifier"
                        ) {
                            const {name} = property;
                            if (methods.has(name)) {
                                context.report({
                                    node: methods.get(name),
                                    messageId: "errorMessage",
                                });
                            }
                        }
                    }
                }
            },
        };
    },
    defaultOptions: [],
});
