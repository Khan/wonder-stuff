// @flow
type MetadataPrimitive = string | number | boolean | null | void;
type MetadataArray<T> = Array<T | MetadataArray<T>>;

/**
 * A collection of data.
 */
export type Metadata = {
    [name: string]:
        | Metadata
        | MetadataPrimitive
        | MetadataArray<MetadataPrimitive | Metadata>,
};
