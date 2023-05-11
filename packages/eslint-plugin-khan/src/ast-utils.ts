import {TSESTree, AST_NODE_TYPES} from "@typescript-eslint/utils";

export function isIdentifier(
    node: TSESTree.Node | undefined,
    options?: {name: string},
): node is TSESTree.Identifier {
    if (!node) {
        return false;
    }
    return options
        ? node.type === AST_NODE_TYPES.Identifier && node.name === options.name
        : node.type === AST_NODE_TYPES.Identifier;
}

export function isCallExpression(
    node: TSESTree.Node | undefined,
): node is TSESTree.CallExpression {
    return node?.type === AST_NODE_TYPES.CallExpression;
}

export function isMemberExpression(
    node: TSESTree.Node | undefined,
): node is TSESTree.MemberExpression {
    return node?.type === AST_NODE_TYPES.MemberExpression;
}

export function isJSXAttribute(
    node: TSESTree.Node | undefined,
): node is TSESTree.JSXAttribute {
    return node?.type === AST_NODE_TYPES.JSXAttribute;
}

export function isJSXIdentifier(
    node: TSESTree.Node | undefined,
    options?: {name: string},
): node is TSESTree.JSXIdentifier {
    return options
        ? node?.type === AST_NODE_TYPES.JSXIdentifier &&
              node.name === options.name
        : node?.type === AST_NODE_TYPES.JSXIdentifier;
}

export function isJSXOpeningElement(
    node: TSESTree.Node | undefined,
): node is TSESTree.JSXOpeningElement {
    return node?.type === AST_NODE_TYPES.JSXOpeningElement;
}

export function isLiteral(
    node: TSESTree.Node | undefined | null,
): node is TSESTree.Literal {
    return node?.type === AST_NODE_TYPES.Literal;
}
