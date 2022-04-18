// @flow
/* istanbul ignore file */
export {default as I18nPlugin} from "./plugins/i18n-plugin.js";
export {extractStrings} from "./utils/extract-i18n.js";
export {
    getFilesToExtractFrom,
    getPOTFileStringFromFiles,
} from "./utils/pofile-utils.js";
export {
    getIgnoreGlobs,
    getI18nStringsFromString,
    translateString,
} from "./utils/i18n-utils.js";
export {getEmojiForLocale} from "./utils/emoji-for-locale.js";

export type {ExtractedString} from "./utils/extract-i18n.js";
export type {TranslatedLocaleStrings} from "./utils/i18n-utils.js";
