const t = require("@babel/types");

module.exports = {
    meta: {
        docs: {
            description:
                "Requires the use more of enzyme matchers where appropriate.",
            category: "jest",
            recommended: false,
        },
        fixable: true,
    },

    create(context) {
        const stack = [];

        return {
            CallExpression(node) {
                if (
                    t.isIdentifier(node.callee, {name: "expect"}) &&
                    t.isCallExpression(node.arguments[0]) &&
                    t.isMemberExpression(node.arguments[0].callee) &&
                    t.isMemberExpression(node.parent) &&
                    t.isIdentifier(node.parent.property) &&
                    t.isCallExpression(node.parent.parent)
                ) {
                    const {property} = node.arguments[0].callee;
                    const matcher = node.parent.property.name;

                    if (matcher === "toEqual") {
                        if (t.isIdentifier(property, {name: "prop"})) {
                            const sourceCode = context.getSource();
                            const propName = node.arguments[0].arguments[0];
                            const expected = sourceCode.slice(
                                ...node.parent.parent.arguments[0].range,
                            );
                            context.report({
                                node,
                                message: `Use .toHaveProp(${propName.raw}, ${expected}) instead.`,
                                fix(fixer) {
                                    const actual = sourceCode.slice(
                                        ...node.arguments[0].callee.object
                                            .range,
                                    );
                                    const text = `expect(${actual}).toHaveProp(${propName.raw}, ${expected})`;
                                    return fixer.replaceText(
                                        node.parent.parent,
                                        text,
                                    );
                                },
                            });
                        } else if (t.isIdentifier(property, {name: "state"})) {
                            const sourceCode = context.getSource();
                            const stateKey = node.arguments[0].arguments[0];
                            const expected = sourceCode.slice(
                                ...node.parent.parent.arguments[0].range,
                            );
                            context.report({
                                node,
                                message: `Use .toHaveState(${stateKey.raw}, ${expected}) instead.`,
                                fix(fixer) {
                                    const actual = sourceCode.slice(
                                        ...node.arguments[0].callee.object
                                            .range,
                                    );
                                    const text = `expect(${actual}).toHaveState(${stateKey.raw}, ${expected})`;
                                    return fixer.replaceText(
                                        node.parent.parent,
                                        text,
                                    );
                                },
                            });
                        } else if (t.isIdentifier(property, {name: "text"})) {
                            const sourceCode = context.getSource();
                            const expected = sourceCode.slice(
                                ...node.parent.parent.arguments[0].range,
                            );
                            context.report({
                                node,
                                message: `Use .toHaveText(${expected}) instead.`,
                                fix(fixer) {
                                    const actual = sourceCode.slice(
                                        ...node.arguments[0].callee.object
                                            .range,
                                    );
                                    const text = `expect(${actual}).toHaveText(${expected})`;
                                    return fixer.replaceText(
                                        node.parent.parent,
                                        text,
                                    );
                                },
                            });
                        } else if (t.isIdentifier(property, {name: "html"})) {
                            const sourceCode = context.getSource();
                            const expected = sourceCode.slice(
                                ...node.parent.parent.arguments[0].range,
                            );
                            context.report({
                                node,
                                message: `Use .toHaveHTML(${expected}) instead.`,
                                fix(fixer) {
                                    const actual = sourceCode.slice(
                                        ...node.arguments[0].callee.object
                                            .range,
                                    );
                                    const text = `expect(${actual}).toHaveHTML(${expected})`;
                                    return fixer.replaceText(
                                        node.parent.parent,
                                        text,
                                    );
                                },
                            });
                        }
                    } else if (
                        matcher === "toBeTrue" ||
                        matcher === "toBeTruthy"
                    ) {
                        if (t.isIdentifier(property, {name: "exists"})) {
                            if (node.arguments[0].arguments.length === 0) {
                                const sourceCode = context.getSource();
                                context.report({
                                    node,
                                    message: `Use .toExist() instead.`,
                                    fix(fixer) {
                                        const actual = sourceCode.slice(
                                            ...node.arguments[0].callee.object
                                                .range,
                                        );
                                        const text = `expect(${actual}).toExist()`;
                                        return fixer.replaceText(
                                            node.parent.parent,
                                            text,
                                        );
                                    },
                                });
                            } else {
                                const sourceCode = context.getSource();
                                const selector = sourceCode.slice(
                                    ...node.arguments[0].arguments[0].range,
                                );
                                context.report({
                                    node,
                                    message: `Use .toContainMatchingElement(${selector}) instead.`,
                                    fix(fixer) {
                                        const actual = sourceCode.slice(
                                            ...node.arguments[0].callee.object
                                                .range,
                                        );
                                        const text = `expect(${actual}).toContainMatchingElement(${selector})`;
                                        return fixer.replaceText(
                                            node.parent.parent,
                                            text,
                                        );
                                    },
                                });
                            }
                        }
                    } else if (
                        matcher === "toBeFalse" ||
                        matcher === "toBeFalsy"
                    ) {
                        if (t.isIdentifier(property, {name: "exists"})) {
                            if (node.arguments[0].arguments.length === 0) {
                                const sourceCode = context.getSource();
                                context.report({
                                    node,
                                    message: `Use .not.toExist() instead.`,
                                    fix(fixer) {
                                        const actual = sourceCode.slice(
                                            ...node.arguments[0].callee.object
                                                .range,
                                        );
                                        const text = `expect(${actual}).not.toExist()`;
                                        return fixer.replaceText(
                                            node.parent.parent,
                                            text,
                                        );
                                    },
                                });
                            } else {
                                const sourceCode = context.getSource();
                                const selector = sourceCode.slice(
                                    ...node.arguments[0].arguments[0].range,
                                );
                                context.report({
                                    node,
                                    message: `Use .not.toContainMatchingElement(${selector}) instead.`,
                                    fix(fixer) {
                                        const actual = sourceCode.slice(
                                            ...node.arguments[0].callee.object
                                                .range,
                                        );
                                        const text = `expect(${actual}).not.toContainMatchingElement(${selector})`;
                                        return fixer.replaceText(
                                            node.parent.parent,
                                            text,
                                        );
                                    },
                                });
                            }
                        }
                    } else if (matcher === "toHaveLength") {
                        if (t.isIdentifier(property, {name: "find"})) {
                            const sourceCode = context.getSource();
                            const selector = sourceCode.slice(
                                ...node.arguments[0].arguments[0].range,
                            );
                            const count = sourceCode.slice(
                                ...node.parent.parent.arguments[0].range,
                            );
                            context.report({
                                node,
                                message: `Use .toContainMatchingElements(${count}, ${selector}) instead.`,
                                fix(fixer) {
                                    const actual = sourceCode.slice(
                                        ...node.arguments[0].callee.object
                                            .range,
                                    );
                                    const text = `expect(${actual}).toContainMatchingElements(${count}, ${selector})`;
                                    return fixer.replaceText(
                                        node.parent.parent,
                                        text,
                                    );
                                },
                            });
                        }
                    }
                }
            },
        };
    },
};
