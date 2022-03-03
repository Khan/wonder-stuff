# Contributing to `wonder-stuff`

🙇Thank you for your interest in contributing to the Wonder Stuff repository. However, **we are not currently accepting community contributions** on this project.

The participation of others is a wonderful 🎁gift. When we are ready to accept that gift, we will update these guidelines.
If you have already been invited to participate, the remainder of these guidelines are for you.

📖 Be sure to read our [Code of Conduct](https://github.com/Khan/render-gateway/blob/master/CODE_OF_CONDUCT.md).

## 🛑 Bugs And Feature Requests

⚠️ **We are not currently accepting externally raised bugs and feature requests**

## 💻 Code Changes

⚠️ **We are not currently accepting externally provided code changes**

### ⓵ Making your first change

Check with the maintainers for a good first issue and we'll help get you going.

### 🎬 Getting Started

To work in the `wonder-stuff` repository, follow these steps:

1. Clone the repository
   `git clone git@github.com:Khan/wonder-stuff.git`
2. Install `yarn` (see [🔗yarnpkg.com](https://yarnpkg.com))
3. Run `yarn install` to install the dependencies

You can now work on `wonder-stuff`. We prefer [🔗Visual Studio Code](https://code.visualstudio.com/) as our development environment (it's cross-platform and awesome), but please use what you feel comfortable with (we'll even forgive you for using vim).

### 🧪 Code Quality

#### Manual

We love code reviews. If there are open pull requests, please feel free to review them and provide feedback. Feedback is a gift and code reviews are often a bottleneck in getting new things released. Jump in, even if you don't know anything; you probably know more than you think.

💭**REMEMBER** Be kind and considerate. Folks are volunteering their time and code reviews are a moment of vulnerability where a criticism of the code can easily become a criticism of the individual that wrote it.

1. Take your time
2. Consider how you might receive the feedback you are giving if it were attached to code you wrote
3. Favor asking questions over prescribing solutions.

#### Automated

To ensure code quality, we use prettier, flow, eslint, and jest. These are all executed automatically on commit, so don't worry if you forget to run them before you commit. They are also executed when you submit, edit, or push to a pull request to ensure the contribution meets our code quality standard.

To execute these operations outside of a pull request or commit operation, you can use `yarn`.

- `yarn flow`
- `yarn lint`
- `yarn test`

💭**REMEMBER** If you would like to contribute code changes to the project, first make sure there's a corresponding issue for the change you wish to make.

## 📦 Build And Publish

Anyone can create a local build of the distributed code by running `yarn build`.

### Publishing

Publishing updated packages is handled by the changesets bot.
