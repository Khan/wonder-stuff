import * as eslintPlugin from "../src/index";
import rules from "../src/rules/index";

describe('eslint-plugin ("./src/index.ts")', () => {
    const ruleKeys = Object.keys(rules);
    const eslintPluginRuleKeys = Object.keys(eslintPlugin.rules);

    it("exports all available rules", () => {
        expect(ruleKeys).toEqual(expect.arrayContaining(eslintPluginRuleKeys));
    });
});
