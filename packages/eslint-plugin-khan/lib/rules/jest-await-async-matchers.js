const t = require("@babel/types");

const getPropertyNames = node => {
    if (!t.isMemberExpression(node)) {
        [];
    }
    if (t.isIdentifier(node.property)) {
        return [node.property.name, ...getPropertyNames(node.parent)];
    }
    return [];
};

const findParentCallExpression = node => {
    if (t.isProgram(node)) {
        return null;
    }
    if (t.isCallExpression(node.parent)) {
        return node.parent;
    }
    return findParentCallExpression(node.parent);
};

const intersect = (array1, array2) => {
    return array1.filter(value => array2.includes(value));
};

const getCustomMatchers = options => {
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

module.exports = {
    meta: {
        docs: {
            description: "",
            category: "jest",
            recommended: false,
        },
        fixable: true,
    },

    create(context) {
        const customMatchers = getCustomMatchers(context.options);
        const allowedMatchers = [...DEFAULT_MATCHERS, ...customMatchers];

        return {
            CallExpression(node) {
                // We only run this check on expect() calls.
                if (!t.isIdentifier(node.callee, {name: "expect"})) {
                    return;
                }
                if (!t.isMemberExpression(node.parent)) {
                    return;
                }
                // While someone could use an indexer to access matchers,
                // that never happens in practice so we don't bother handling
                // this edge case.
                if (!t.isIdentifier(node.parent.property)) {
                    return;
                }

                // Gets all the properties in a jest assertion, e.g.
                // expect(foo).not.toEqual(bar) would result in the
                // following property names: ["not", "toEqual"].
                const propertyNames = getPropertyNames(node.parent);

                // This should only contain a single entry when there's a match
                const intersection = intersect(propertyNames, allowedMatchers);
                if (intersection.length === 0) {
                    return;
                }

                // This is the matcher call itself, e.g. .toBe(true)
                const parentCallExpression = findParentCallExpression(node);
                if (!parentCallExpression) {
                    return;
                }

                if (!t.isAwaitExpression(parentCallExpression.parent)) {
                    context.report({
                        node: parentCallExpression,
                        message: `Assertions using \`${intersection.join(
                            ", ",
                        )}\` should be awaited.`,
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
};
