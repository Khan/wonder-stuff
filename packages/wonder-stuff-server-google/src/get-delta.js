// @flow
type NumberObj = {
    [key: string]: number,
    ...
};

export const getDelta = <T: NumberObj>(first: T, second: T): T => {
    const result: $Shape<T> = {};
    for (const key of Object.keys(first)) {
        result[key] = second[key] - first[key];
    }
    return result;
};
