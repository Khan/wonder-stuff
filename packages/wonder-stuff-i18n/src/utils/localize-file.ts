/**
 * Utility that localizes Webpack-generated files with the correct public
 * path to properly handle dynamic loading of bundles. Used by
 * i18n-plugin.js. This runs against manifest files and runtime files.
 *
 * The reason this is necessary is that Webpack is responsible
 * for dynamically loading bundles, which have a hardcoded path that points
 * to the configured public path in our webpack configs. Since the public path
 * points to {{env}}/en/ when we bundle our app, all dynamically loaded assets
 * will always be English. For the webpack runtime to dynamically load the
 * correct bundles, we need to create different runtimes that point to the
 * correct location.
 *
 * For example, the English runtime has a hardcoded path:
 * __webpack_require__.p = "/en/";
 *
 * That means that every request to dynamically load bundles will use
 * that path, which wont work for locales like /es/ for example. So
 * in the /es/ locale to load get the es translated bundles, we need to have
 * a runtime with a path like:
 * __webpack_require__.p = "/es/";
 *
 * Additionally, the hashes of some of the files have changed during the
 * translation process. This utility is also responsible for updating those
 * hashes to point to the new hashes instead.
 */

import crypto from "crypto";

// A regex for finding 20 character hashes (as used by Webpack)
const HASH_RE = /\b[a-f0-9]{20}\b/g;

// A regex for finding 20 character hashes (as used by Webpack) at the end of
// a file name
const HASH_FILENAME_RE = /\.([a-f0-9]{20})\.js$/;

/**
 * Extract a hash from a fileName, if one exists.
 *
 * @param {string} fileName the file name to extract the hash from
 * @returns {string|null} the hash, or null if none was found
 */
export const extractHashFromFileName = (fileName: string): string =>
    (HASH_FILENAME_RE.exec(fileName) || [])[1];

/**
 * Localizes a string with the new public path for the specific locale and with
 * the new file hashes for JS files, if they've changed.
 *
 * @param {string} locale the locale to localize to
 * @param {string} content the JS file contents to localize
 * @param {Object} hashMap a mapping of old to new hashes
 */
export const localizeString = ({
    locale,
    content,
    hashMap,
    getLocalePath,
}: {
    locale: string;
    content: string;
    hashMap?:
        | {
              [key: string]: string;
          }
        | null
        | undefined;
    getLocalePath: (arg1: string) => string;
}): string => {
    // Replace all English paths with the path to the locale
    const newContent = content.replace(
        new RegExp(getLocalePath("en"), "g"),
        getLocalePath(locale),
    );

    if (!hashMap) {
        return newContent;
    }

    // Look for all hash-like strings and replace the ones that can be found
    // in the hash map, leaving all others intact
    return newContent.replace(HASH_RE, (hash) => hashMap[hash] || hash);
};

/**
 * Produce an MD5 hash of the contents of a file that is 20 characters long.
 *
 * @param {string} contents The contents of a file
 */
export const hashFileContents = (contents: string): string =>
    crypto.createHash("md5").update(contents).digest("hex").slice(0, 20);

/**
 * Localizes a file with the new public path for the specific locale and with
 * the new file hashes for JS files, if they've changed.
 *
 * NOTE: hashMap is mutated when this is called, it's updated with any new
 * hashes and their mapping.
 *
 * @param {string} locale the locale to localize to
 * @param {string} fileName the file name to read in and out to localize
 * @param {Object} hashMap a mapping of old to new hashes, this object is
 * updated when new hashes are generated for files.
 */
export const localizeFile = ({
    content,
    locale,
    oldHash,
    hashMap,
    getLocalePath,
}: {
    content: string;
    locale: string;
    oldHash: string | null | undefined;
    hashMap: {
        [key: string]: string;
    };
    getLocalePath: (arg1: string) => string;
}): string => {
    const newContent = localizeString({
        locale,
        content,
        hashMap,
        getLocalePath,
    });

    if (oldHash != null) {
        // Compute the new hash of the file contents
        const newHash = hashFileContents(newContent);

        // If the hash of the file contents has changed then we need to
        // update the hash in the file name and also update it in other
        // sources (such as the manifest files), so we update the hashMap
        // so that it will update when we call localizeFile on the manifests.
        if (oldHash !== newHash) {
            hashMap[oldHash] = newHash;

            // We also need to update any existing mappings that already are
            // in place to point to the new hash as well
            for (const hash of Object.keys(hashMap)) {
                if (hashMap[hash] === oldHash) {
                    hashMap[hash] = newHash;
                }
            }
        }
    }

    return newContent;
};
