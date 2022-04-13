// @flow
/**
 * Provide an emoji to represent a locale.
 *
 * This is primarily used by i18n-plugin.js to provide nice output.
 */
const LOCALE_TO_EMOJI_MAP = {
    accents: "✨", // Accents
    bg: "🇧🇬", // Bulgarian --Bulgaria
    bn: "🇮🇳", // Bengali -- India
    boxes: "📦", // Unicode boxes
    cs: "🇨🇿", // Czech -- Czech Republic
    da: "🇩🇰", // Danish -- Denmark
    de: "🇩🇪", // German -- Germany
    en: "🇬🇧", // English -- UK
    "en-pt": "☠️", // Pirate english
    es: "🇲🇽", // Spanish
    fr: "🇫🇷", // French
    gu: "🇮🇳", // Gujarati -- India
    he: "🇮🇱", // Hebrew -- Israel
    hi: "🇮🇳", // Hindi -- India
    hy: "🇦🇲", // Armenian -- Armenia
    id: "🇮🇩", // Indonesian -- Indonesia
    it: "🇮🇹", // Italian -- Italy
    ja: "🇯🇵", // Japanese -- Japan
    ka: "🇬🇪", // Georgian -- Georgia
    lol: "😻", // Lolspeak?
    mn: "🇲🇳", // Mongolian -- Mongolia
    nb: "🇳🇴", // Norwegian -- Norway
    nl: "🇳🇱", // Dutch -- Netherlands
    pl: "🇵🇱", // Polish -- Poland
    pt: "🇧🇷", // Portuguese -- Brazil
    "pt-pt": "🇵🇹", // Portuguese -- Portugal
    ru: "🇷🇺", // Russia -- Russian
    sr: "🇷🇸", // Serbian -- Serbia
    sv: "🇸🇪", // Swedish -- Sweden
    ta: "🇱🇰", // Tamil -- Sri Lanka
    tr: "🇹🇷", // Turkish -- Turkey
    "zh-hans": "🇹🇼", // Mandarin -- Taiwan
};

/**
 * Given a locale, get an emoji representing that locale.
 *
 * @param {string} locale the locale string to get the emoji for
 */
export const getEmojiForLocale: (locale: string) => string = (locale: string) =>
    LOCALE_TO_EMOJI_MAP[locale] || "";
