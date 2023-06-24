export type VersionInfo = {
    alias: string;
    version: string;
    outdated: boolean;
};

export type PackageVersions = {
    name: string;
    versions: Array<VersionInfo>;
};

export type PackageInfo = {
    alias: string;
    version: string;
    name: string;
};

export type PackagesComparison = {
    pkgs: Array<PackageInfo>;
    message: string;
};

export type TransformOptions = {
    /**
     * The absolute path to the transform binary.
     */
    cmd: string;

    /**
     * The arguments to pass to the command.
     */
    args: Array<string>;
};

export type UpdatePackagesOptions = {
    /**
     * The prefix of the package set.
     * This is used to filter the list of packages.
     * For example, if the prefix is `@wonder-blocks/`, then only packages
     * starting with `@wonder-blocks/` will be included.
     */
    pkgPrefix: string;

    /**
     * A human-readable name for the package set.
     */
    pkgSetName: string;

    /**
     * The path to the root of the package being updated.
     * This is where the package.json being processed lives.
     */
    cwd?: string;

    /**
     * Options for handling file transforms when aliasing packages.
     */
    transformOptions?: TransformOptions;

    /**
     * The search for possible package versions is limited by this number.
     * When not specified, the default is 1000.
     */
    searchLimit?: number;
};
