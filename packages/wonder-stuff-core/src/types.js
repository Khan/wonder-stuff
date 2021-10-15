// @flow
type MetadataPrimitive = string | number | boolean;

/**
 * A collection of data.
 */
export type Metadata = {
    [name: string]: ?(
        | MetadataPrimitive
        | $ReadOnly<Metadata>
        | $ReadOnlyArray<?(MetadataPrimitive | Metadata)>
    ),
    ...
};
