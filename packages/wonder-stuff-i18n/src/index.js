// @flow
/* istanbul ignore file */
export {default as I18nPlugin} from "./plugins/i18n-plugin";
export {extractStrings} from "./utils/extract-i18n";
export {
    getFilesToExtractFrom,
    getPOTFileStringFromFiles,
} from "./utils/pofile-utils";
export {
    getIgnoreGlobs,
    getI18nStringsFromString,
    translateString,
} from "./utils/i18n-utils";
export {getEmojiForLocale} from "./utils/emoji-for-locale";

export type {ExtractedString} from "./utils/extract-i18n";
export type {TranslatedLocaleStrings} from "./utils/i18n-utils";
