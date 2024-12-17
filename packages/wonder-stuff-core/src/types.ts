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

/**
 * Make a read-only type mutable.
 */
export type Mutable<T> = {-readonly [P in keyof T]: T[P]};

/**
 * Remove the keys in `R` from `C`.
 */
export type Without<C, R> = Omit<C, keyof R>;

/**
 * Opposite of `NonNullable<T>`.
 *
 * This type is most useful in making code that's been converted from Flow
 * to TypeScript more readable.
 */
export type Nullable<T> = T | null | undefined;

/**
 * This type can be used in place of `any` to indicate that we don't know
 * what the type is, but we know that it is wrong and needs to be fixed.
 *
 * It's similar to $FlowFixMe in Flow.
 *
 * This should be used in situations where `@ts-expect-error` cannot be used
 * or should not be used (as is the case with type errors on props in JSX
 * elements).
 */
export type TSFixMe<Message extends string = string> = Message & any;
