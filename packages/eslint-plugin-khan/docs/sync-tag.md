# Ensure that sync tags are valid

Sync tags provide a way keep code in separate files in sync.  This lint rule
uses [checksync](https://github.com/somewhatabstract/checksync) to validate
sync tags and provide fixes when possible. 

Notes:
- All paths in `ignoreFiles` are considered to be relative to `rootDir`.
- `rootDir` is required and should usually be set to the root directory of the
  repo.  This requires the the configuration of `@khanacademy/sync-tags` to be done in
  a `.js` file.
