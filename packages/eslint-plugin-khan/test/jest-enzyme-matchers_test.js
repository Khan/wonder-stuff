const path = require("path");

const {rules} = require("../lib/index.js");
const RuleTester = require("eslint").RuleTester;

const parserOptions = {
    parser: "babel-eslint",
};

const ruleTester = new RuleTester(parserOptions);
const rule = rules["jest-enzyme-matchers"];

ruleTester.run("jest-real-timers", rule, {
    valid: [
        {
            code: 'expect(wrapper).toHaveProp("foo", "bar");',
            options: [],
        },
        {
            code: 'expect(wrapper).toHaveState("foo", "bar");',
            options: [],
        },
        {
            code: 'expect(wrapper).toContainMatchingElements(1, ".foo");',
            options: [],
        },
        {
            code: 'expect(wrapper.find(".foo")).toHaveText("bar");',
            options: [],
        },
        {
            code: 'expect(wrapper.find(".foo")).toHaveHTML("<p>bar</p>");',
            options: [],
        },
        {
            code: 'expect(wrapper.find(".foo")).toExist();',
            options: [],
        },
        {
            code: 'expect(wrapper).toContainMatchingElement(".foo");',
            options: [],
        },
        {
            code: 'expect(wrapper.find(".foo")).not.toExist();',
            options: [],
        },
        {
            code: 'expect(wrapper).not.toContainMatchingElement(".foo");',
            options: [],
        },
    ],
    invalid: [
        {
            code: `expect(wrapper.prop("foo")).toEqual("bar");`,
            options: [],
            errors: ['Use .toHaveProp("foo", "bar") instead.'],
            output: 'expect(wrapper).toHaveProp("foo", "bar");',
        },
        {
            code: `expect(wrapper.first().prop("foo")).toEqual("bar");`,
            options: [],
            errors: ['Use .toHaveProp("foo", "bar") instead.'],
            output: 'expect(wrapper.first()).toHaveProp("foo", "bar");',
        },
        {
            code: `expect(wrapper.state("foo")).toEqual("bar");`,
            options: [],
            errors: ['Use .toHaveState("foo", "bar") instead.'],
            output: 'expect(wrapper).toHaveState("foo", "bar");',
        },
        {
            code: `expect(wrapper.first().state("foo")).toEqual("bar");`,
            options: [],
            errors: ['Use .toHaveState("foo", "bar") instead.'],
            output: 'expect(wrapper.first()).toHaveState("foo", "bar");',
        },
        {
            code: `expect(wrapper.find(".foo")).toHaveLength(1);`,
            options: [],
            errors: ['Use .toContainMatchingElements(1, ".foo") instead.'],
            output: 'expect(wrapper).toContainMatchingElements(1, ".foo");',
        },
        {
            code: `expect(wrapper.find(".foo")).toHaveLength(2);`,
            options: [],
            errors: ['Use .toContainMatchingElements(2, ".foo") instead.'],
            output: 'expect(wrapper).toContainMatchingElements(2, ".foo");',
        },
        {
            code: `expect(wrapper.find(".foo").text()).toEqual("bar");`,
            options: [],
            errors: ['Use .toHaveText("bar") instead.'],
            output: 'expect(wrapper.find(".foo")).toHaveText("bar");',
        },
        {
            code: `expect(wrapper.find(".foo").html()).toEqual("<p>bar</p>");`,
            options: [],
            errors: ['Use .toHaveHTML("<p>bar</p>") instead.'],
            output: 'expect(wrapper.find(".foo")).toHaveHTML("<p>bar</p>");',
        },
        {
            code: `expect(wrapper.find(".foo").exists()).toBeTrue();`,
            options: [],
            errors: ["Use .toExist() instead."],
            output: 'expect(wrapper.find(".foo")).toExist();',
        },
        {
            code: `expect(wrapper.find(".foo").exists()).toBeTruthy();`,
            options: [],
            errors: ["Use .toExist() instead."],
            output: 'expect(wrapper.find(".foo")).toExist();',
        },
        {
            code: `expect(wrapper.exists(".foo")).toBeTrue();`,
            options: [],
            errors: ['Use .toContainMatchingElement(".foo") instead.'],
            output: 'expect(wrapper).toContainMatchingElement(".foo");',
        },
        {
            code: `expect(wrapper.exists(".foo")).toBeTruthy();`,
            options: [],
            errors: ['Use .toContainMatchingElement(".foo") instead.'],
            output: 'expect(wrapper).toContainMatchingElement(".foo");',
        },
        {
            code: `expect(wrapper.find(".foo").exists()).toBeFalse();`,
            options: [],
            errors: ["Use .not.toExist() instead."],
            output: 'expect(wrapper.find(".foo")).not.toExist();',
        },
        {
            code: `expect(wrapper.find(".foo").exists()).toBeFalsy();`,
            options: [],
            errors: ["Use .not.toExist() instead."],
            output: 'expect(wrapper.find(".foo")).not.toExist();',
        },
        {
            code: `expect(wrapper.exists(".foo")).toBeFalse();`,
            options: [],
            errors: ['Use .not.toContainMatchingElement(".foo") instead.'],
            output: 'expect(wrapper).not.toContainMatchingElement(".foo");',
        },
        {
            code: `expect(wrapper.exists(".foo")).toBeFalsy();`,
            options: [],
            errors: ['Use .not.toContainMatchingElement(".foo") instead.'],
            output: 'expect(wrapper).not.toContainMatchingElement(".foo");',
        },
    ],
});
