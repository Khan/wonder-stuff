import {RuleTester} from "@typescript-eslint/rule-tester";

import {rules} from "../../src/index";

const ruleTester = new RuleTester({
    languageOptions: {
        parserOptions: {
            ecmaVersion: 6,
            sourceType: "module",
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
    linterOptions: {
        // NOTE(kevinb): Avoids 'TypeError: Expected a Boolean' error
        // when running the tests.
        reportUnusedDisableDirectives: true,
    },
});

const ruleName = "react-no-method-jsx-attribute";
const rule = rules[ruleName];

ruleTester.run("react-no-method-jsx-attribute", rule, {
    valid: [
        // method arrow function in constructor
        {
            code: `
class Foo {
    constructor() {
        this.handleClick = () => {};
    }

    render() {
        return <div onClick={this.handleClick} />
    }
}`,
        },
        // method arrow function class property
        {
            code: `
class Foo {
    handleClick = () => {}

    render() {
        return <div onClick={this.handleClick} />
    }
}`,
        },
        // different classes using the same event handler
        {
            code: `
class Foo {
    handleClick = () => {}

    render() {
        return <div onClick={this.handleClick} />
    }
}

class Bar {
    handleClick() {}

    render() {
        return <div onClick={() => this.handleClick()} />
    }
}`,
        },
        // getter method - called in Foo's scope so it's fine
        {
            code: `
class Foo {
    get bar() {
        return this._bar;
    }

    render() {
        return <div id={this.bar} />
    }
}`,
        },
    ],
    invalid: [
        // regular method, not okay
        {
            code: `
class Foo {
    handleClick() {}

    render() {
        return <div onClick={this.handleClick} />
    }
}`,

            errors: [{messageId: "errorMessage"}],
        },
        // two regular methods, both not okay, two errors
        {
            code: `
class Foo {
    handleClick() {}

    render() {
        return <div onClick={this.handleClick} />
    }
}

class Bar {
    handleClick() {}

    render() {
        return <div onClick={this.handleClick} />
    }
}`,

            errors: [{messageId: "errorMessage"}, {messageId: "errorMessage"}],
        },
    ],
});
