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
