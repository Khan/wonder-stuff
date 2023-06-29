const path = require("path");

const checkImport = (context, rootDir, importPath, node) => {
    const maybeReport = (importPath, testRulePath, testImportPath) => {
        // TODO(somewhatabstract): This is not cross-platform. We need to do
        // more work to make this rule work on Windows properly, regardless of
        // the configuration format.
        const subRulePath = testRulePath.endsWith(path.sep)
            ? testRulePath
            : `${testRulePath}${path.sep}`;

        // If the path is the same, then it's a match for the error.
        // If the path starts with the module listed, then it's also a match.
        if (
            testImportPath === testRulePath ||
            testImportPath.startsWith(subRulePath)
        ) {
            context.report({
                node,
                message: `Importing "${importPath}" requires using flow.`,
            });
            return true;
        }
        return false;
    };

    const modules = context.options[0].modules || [];

    for (const mod of modules) {
        if (importPath.startsWith(".")) {
            const filename = context.getFilename();
            const absImportPath = path.join(path.dirname(filename), importPath);
            const absModPath = path.join(rootDir, mod);
            if (maybeReport(importPath, absModPath, absImportPath)) {
                break;
            }
        } else {
            if (maybeReport(importPath, mod, importPath)) {
                break;
            }
        }
    }

    const regexes = context.options[0].regexes || [];

    for (const src of regexes) {
        const regex = new RegExp(src);
        if (regex.test(importPath)) {
            context.report({
                node,
                message: `Importing "${importPath}" requires using flow.`,
            });
            break;
        }
    }
};

const isRequire = ({callee}) =>
    callee.type === "Identifier" && callee.name === "require";
const isDynamicImport = ({callee}) => callee.type === "Import";

export default {
    meta: {
        docs: {
            description: "Require flow when using certain imports",
            category: "flow",
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    modules: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    regexes: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                    },
                    rootDir: {
                        type: "string",
                    },
                },
            },
        ],
    },

    create(context) {
        const rootDir = context.options[0].rootDir;
        if (!rootDir) {
            throw new Error("rootDir must be set");
        }

        let usingFlow = false;
        return {
            Program(node) {
                usingFlow = node.comments.some(
                    (comment) => comment.value.trim() === "@flow",
                );
            },
            ImportDeclaration(node) {
                if (!usingFlow) {
                    const importPath = node.source.value;
                    checkImport(context, rootDir, importPath, node);
                }
            },
            ImportExpression(node) {
                if (!usingFlow) {
                    const importPath = node.source.value;
                    checkImport(context, rootDir, importPath, node);
                }
            },
            // legacy support for dynamic imports
            CallExpression(node) {
                const {arguments: args} = node;
                if (!usingFlow && (isRequire(node) || isDynamicImport(node))) {
                    if (args[0] && args[0].type === "Literal") {
                        const importPath = args[0].value;
                        checkImport(context, rootDir, importPath, node);
                    }
                }
            },
        };
    },
};
