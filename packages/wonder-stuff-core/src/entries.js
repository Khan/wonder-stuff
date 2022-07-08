// @flow
export function entries<K, V>(obj: {[K]: V}): Array<[K, V]> {
    // This cast is deliberate as Object.entries is typed to return
    // Array<[string, mixed]>, but we want to return Array<[K, V]>.
    // $FlowIgnore[unclear-type]
    return (Object.entries(obj): any);
}
