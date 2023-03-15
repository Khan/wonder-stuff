export type MetadataPrimitive = string | number | boolean | null | undefined;
export type MetadataArray<T> = Array<T | MetadataArray<T>>;

/**
 * A collection of data.
 */
export type Metadata = {
    [name: string]:
        | Metadata
        | MetadataPrimitive
        | MetadataArray<MetadataPrimitive | Metadata>;
};

/**
 * This symbol is used so we can create an opaque type, using a custom field
 * that cannot be directly referenced since folks won't have access to the
 * symbol.
 *
 * See https://stackoverflow.com/a/56749647/23234
 */
declare const opaque: unique symbol;

/**
 * A secret that is a string.
 *
 * This opaque type makes it clearer when secrets are being used and enforces
 * the need for explicit casting if they must be used as a string.
 */
export type SecretString = {readonly [opaque]: "Secret"};

/**
 * A collection of secrets keyed by their names.
 */
export type Secrets = {readonly [key: string]: SecretString};
