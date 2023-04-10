/**
 * Extract release version and prefix from mobile release branch.
 *
 * Example, given the branch `release/unified/v7.8.0`:
 * {
 *    prefix: "release/unified/",
 *    version: "7.8.0"
 * }
 *
 * @param {string} The release branch of the form `[release/[unified|ios|android]]/[v]<num>.<num>.<num>[-extra]`.
 * @returns {Object} The release version and prefix, if found; otherwise, `null`.
 */
export const extractMobileReleaseInfoFromBranchName = (arg: string | null) => {
    if (!arg) {
        return null;
    }

    const match = arg.match(
        /^(release\/(ios|android|unified)\/)?v?(\d+\.\d+\.\d+(-\w*)*)$/i,
    );
    return match && match.length >= 3 && match[3]
        ? {prefix: match[1] || "release/unified/", version: match[3]}
        : null;
};
