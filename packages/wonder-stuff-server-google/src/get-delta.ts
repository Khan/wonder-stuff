type NumberObj = {
    [key: string]: number
};

export const getDelta = <T extends NumberObj>(first: T, second: T): T => {
    const result: Partial<T> = {};
    for (const key of Object.keys(first)) {
// @ts-expect-error - TS2536 - Type 'string' cannot be used to index type 'Partial<T>'.
        result[key] = second[key] - first[key];
    }
// @ts-expect-error - TS2322 - Type 'Partial<T>' is not assignable to type 'T'.
    return result;
};
