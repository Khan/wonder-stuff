import execProm from "./exec-prom";

/**
 *
 * @returns all release tags sorted creation time ascending
 */
const getReleaseTags = async (): Promise<Array<string>> => {
    const tags = await allReleaseTags();
    return tags
        .filter((tag) =>
            tag.match(/^(ios|android|unified)-(\d+\.\d+\.\d+(-\w*)*)$/i),
        )
        .sort(compareVersions);
};

/**
 * Compares two versions of the form <num>.<num>.<num>
 * @param v1
 * @param v2
 * @returns int, 1 if v1 > v2, -1 if v1 < v2, 0 if v1 == v2
 */
export const compareVersions = (v1: string, v2: string) => {
    const v1v = v1.includes("-") ? v1.split("-")[1] : v1;
    const v2v = v2.includes("-") ? v2.split("-")[1] : v2;
    const v1p = v1v.replace(/^v/g, "").split(".");
    const v2p = v2v.replace(/^v/g, "").split(".");
    for (let i = 0; i < v1p.length || i < v2p.length; i++) {
        const p1 = +v1p[i] || 0;
        const p2 = +v2p[i] || 0;
        if (+p1 !== +p2) {
            return p1 > p2 ? 1 : -1;
        }
    }
    return 0;
};

/**
 * Matches [release/[unified|ios|android]]/[v]<num>.<num>.<num>[-extra]
 * @param arg
 * @returns match, if found, null otherwise
 */
export const isGetReleaseBranch = (arg: string) => {
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

/**
 *
 * @returns all release tags sorted creation time ascending
 */
const allReleaseTags = async (): Promise<Array<string>> => {
    // Why not use simple-git here? Because for some reason it takes like 100x as long.
    await execProm("git fetch --tags", true);
    const prom: Promise<{
        err: Error | null | undefined;
        stdout: string;
        stderr: string;
    }> = execProm("git tag | grep -E -i -w 'ios|android|unified'", true);

    const {stdout} = await prom;
    return stdout.split("\n").filter(Boolean);
};
