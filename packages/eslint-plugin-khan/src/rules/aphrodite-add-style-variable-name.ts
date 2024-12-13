import {TSESTree, ESLintUtils, AST_NODE_TYPES} from "@typescript-eslint/utils";

import type {MyPluginDocs} from "../types";

const createRule = ESLintUtils.RuleCreator<MyPluginDocs>(
    (name) =>
        `https://github.com/Khan/wonder-stuff/blob/main/packages/eslint-plugin-khan/docs/${name}.md`,
);

type Options = [];
type MessageIds = "errorString";

const message = `Variable name "{{ variableName }}" does not match the expected naming convention. Expected: "{{ expectedName }}"`;

/**
 * Converts a string into PascalCase.
 * @param str The string to convert
 * @returns The PascalCase version of the string
 */
function toPascalCase(str: string): string {
    // Check if the string is already in PascalCase
    if (/^[A-Z][a-zA-Z]*$/.test(str)) {
        return str;
    }

    // Split the string into words based on common delimiters (space, underscore, hyphen, etc.)
    const words = str.split(/[_\-\s]+/);

    // Capitalize the first letter of each word and join them together
    const pascalCase = words
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join("");

    return pascalCase;
}

export default createRule<Options, MessageIds>({
    name: "aphrodite-add-style-variable-name",
    meta: {
        docs: {
            description:
                "Variable name should match the tag name passed into addStyle and follow the format: StyledTag (ie. StyledDiv, StyledImg)",
            recommended: true,
        },
        messages: {
            errorString: message,
        },
        schema: [],
        type: "problem",
    },
    defaultOptions: [],
    create(context) {
        return {
            VariableDeclarator(node: TSESTree.VariableDeclarator) {
                // Return early if it isn't calling a function
                if (node.init?.type !== AST_NODE_TYPES.CallExpression) {
                    return;
                }
                // Return early if addStyle is not being called
                if (
                    node.init.callee.type !== AST_NODE_TYPES.Identifier ||
                    node.init.callee.name !== "addStyle"
                ) {
                    return;
                }

                // Get variable name for the addStyle return value
                const variableName =
                    node.id.type === AST_NODE_TYPES.Identifier
                        ? node.id.name
                        : null;

                // Return early if there is no variable name
                if (variableName === null) {
                    return;
                }

                // Get the tag name that was passed into addStyle
                const firstArg = node.init.arguments[0];

                // Return early if the argument is not a string literal
                if (
                    firstArg?.type !== AST_NODE_TYPES.Literal ||
                    typeof firstArg.value !== "string"
                ) {
                    return;
                }

                const tagName = firstArg.value;
                const expectedName = `Styled${toPascalCase(tagName)}`;

                // Check if the variable name matches the expected pattern
                if (variableName !== expectedName) {
                    context.report({
                        node: node.id,
                        messageId: "errorString",
                        data: {
                            variableName,
                            expectedName,
                        },
                    });
                }
            },
        };
    },
});
