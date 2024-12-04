import {ESLintUtils, TSESTree, AST_NODE_TYPES} from "@typescript-eslint/utils";

import type {MyPluginDocs} from "../types";

const createRule = ESLintUtils.RuleCreator<MyPluginDocs>(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

/**
 * Find and return the `beforeEach` call node inside a describe block if one exists.
 *
 * @param {CallExpression} describeCall the node for a call to `describe`.
 */
const findBeforeEach = (
    describeCall: TSESTree.CallExpression,
): TSESTree.CallExpression | null => {
    const funcExpr = describeCall.arguments[1];
    if (
        funcExpr &&
        (funcExpr.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            funcExpr.type === AST_NODE_TYPES.FunctionExpression) &&
        funcExpr.body.type === AST_NODE_TYPES.BlockStatement
    ) {
        for (const stmt of funcExpr.body.body) {
            if (stmt.type === AST_NODE_TYPES.ExpressionStatement) {
                const expr = stmt.expression;
                if (
                    expr.type === AST_NODE_TYPES.CallExpression &&
                    expr.callee.type === AST_NODE_TYPES.Identifier &&
                    expr.callee.name === "beforeEach"
                ) {
                    return expr;
                }
            }
        }
    }
    return null;
};

/**
 * Determine if a `beforeEach` or `it` block has called jest.useRealTimers().
 *
 * NOTE: The call cannot be inside a control flow statement.
 *
 * @param {CallExpression} call the node for a call to `beforeEach` or `it`.
 * @param {number} closureArgIndex the arg index of the closure passed to `call`.
 */
const usesRealTimers = (
    call: TSESTree.CallExpression | null,
    closureArgIndex = 0,
) => {
    if (call == null) {
        return false;
    }
    const funcExpr = call.arguments[closureArgIndex];

    if (
        funcExpr &&
        (funcExpr.type === AST_NODE_TYPES.ArrowFunctionExpression ||
            funcExpr.type === AST_NODE_TYPES.FunctionExpression) &&
        funcExpr.body.type === AST_NODE_TYPES.BlockStatement
    ) {
        for (const stmt of funcExpr.body.body) {
            if (stmt.type === AST_NODE_TYPES.ExpressionStatement) {
                const expr = stmt.expression;
                if (
                    expr.type === AST_NODE_TYPES.CallExpression &&
                    expr.callee.type === AST_NODE_TYPES.MemberExpression
                ) {
                    const {object, property} = expr.callee;
                    if (
                        object.type === AST_NODE_TYPES.Identifier &&
                        object.name === "jest" &&
                        property.type === AST_NODE_TYPES.Identifier &&
                        property.name === "useRealTimers"
                    ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
};

const isAsync = (itCall: TSESTree.CallExpression) => {
    const arg1 = itCall.arguments[1];

    return (
        (arg1.type === AST_NODE_TYPES.ArrowFunctionExpression && arg1.async) ||
        (arg1.type === AST_NODE_TYPES.FunctionExpression && arg1.async)
    );
};

type Options = [];
type MessageIds = "errorString";

const message = "Async tests require jest.useRealTimers().";

export default createRule<Options, MessageIds>({
    name: "jest-async-use-real-timers",
    meta: {
        docs: {
            description:
                "Require a call to jest.useRealTimers() before or in all async tests.",
            recommended: false,
        },
        messages: {
            errorString: message,
        },
        schema: [],
        type: "problem",
    },

    create(context) {
        const stack: Array<boolean> = [];

        return {
            CallExpression(node) {
                if (
                    node.callee.type === AST_NODE_TYPES.Identifier &&
                    node.callee.name === "describe"
                ) {
                    stack.push(usesRealTimers(findBeforeEach(node), 0));
                } else if (
                    node.callee.type === AST_NODE_TYPES.Identifier &&
                    node.callee.name === "it" &&
                    isAsync(node)
                ) {
                    // an `it` should always be inside a `describe`
                    if (stack.length > 0) {
                        if (!stack.some(Boolean) && !usesRealTimers(node, 1)) {
                            context.report({
                                node,
                                messageId: "errorString",
                            });
                        }
                    }
                }
            },
            "CallExpression:exit"(node: TSESTree.CallExpression) {
                if (
                    node.callee.type === AST_NODE_TYPES.Identifier &&
                    node.callee.name === "describe"
                ) {
                    stack.pop();
                }
            },
        };
    },

    defaultOptions: [],
});
