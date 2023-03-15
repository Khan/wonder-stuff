type NumberObj = {
    [key: string]: number;
};

export const getDelta = (first: NumberObj, second: NumberObj): NumberObj => {
    const result: NumberObj = {};
    for (const key of Object.keys(first)) {
        result[key] = second[key] - first[key];
    }
    return result;
};
