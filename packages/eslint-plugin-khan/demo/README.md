# @khanacademy/eslint-plugin - demo

The purpose of this directory is to be able to facilitate manual integration testing of
the custom eslint rules this plugin provides.

After making a change to the plugin source code, you'll need to take following steps to
update the demo:
- run `pnpm install` and `pnpm build` from the root directory of the repository
- `cd packages/eslint-plugin-khan/demo`
- `pnpm eslint .`

Your editor/IDE should report eslint errors that accurately reflect the changes you made
to the plugin.

NOTE: A number of our rules provide autofixes so please avoid checking in those fixes.
