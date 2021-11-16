// @flow
/**
 * Determine if a given string is a reserved property name for Sentry contexts.
 *
 * @export
 * @param {string} propertyName The property name to check.
 * @returns {boolean} `true` if the property name is a reserved property name;
 * otherwise, `false`.
 */
export function isReservedContextProperty(propertyName: string): boolean {
    // From:
    // https://docs.sentry.io/platforms/python/guides/logging/enriching-events/context/
    const RESERVED_CONTEXT_PROPERTIES = new Set(["type"]);
    return RESERVED_CONTEXT_PROPERTIES.has(propertyName);
}
