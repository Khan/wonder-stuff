import {compareVersions} from "./compare-versions";
import {getTagsFromGit} from "./get-tags-from-git";

/**
 * Get mobile release tags.
 *
 * Tags are filtered to only include those matching our tag version format
 * (`<tag>-<num>.<num>.<num>`), then they are sorted by the version information from
 * earliest version to most recent.
 *
 * @returns {Promise<Array<string>>} all release tags sorted creation time ascending
 */
export const getMobileReleaseTags = async (): Promise<Array<string>> => {
    const tags = await getTagsFromGit();
    return tags
        .filter((tag) =>
            tag.match(/^(ios|android|unified)-(\d+\.\d+\.\d+(-\w*)*)$/i),
        )
        .sort(compareVersions);
};
