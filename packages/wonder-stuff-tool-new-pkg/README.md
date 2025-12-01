# wonder-stuff-tool-publish-new-pkg

This Wonder Stuff package is a `pnpm dlx` (or `npx`) compatible tool package
that helps to publish a new package to npmjs. Khan Academy has shifted entirely
to publishing package using [Trusted
Publishing](https://docs.npmjs.com/trusted-publishers). This presents a problem
when publishing a new package because the package does not yet exist on
npmjs.com and so Trusted Publishing cannot be configured for it. 

To work around that problem, this package guides you through publishing a
placeholder package under the desired name using a short-lived, granular npm
access token. Once the placeholder has been published, it's possible to
configure the package on npmjs.com for Trusted Publishing and then never deal
with tokens again. 

## Usage 

```
$ pnpm dlx @khanacademy/wonder-stuff-tool-publish-new-pkg @khanacademy/my-new-package
```

This package accepts a single paramter, the new package's name. The script will
then guide you through the rest of the steps to get a placeholder package
published.
