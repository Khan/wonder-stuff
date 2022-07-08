// @flow
import {entries} from "../entries.js";

{
    // should type returned array element as tuples of keys as string subtype
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    };

    const entries1 = entries(obj1);

    // This works because the keys are all strings
    const [_]: [string, mixed] = entries1[0];
}

{
    // should type returned array element as tuples supertype of keys
    const obj2 = {
        a: 1,
        b: "2",
        c: [3, 4],
    };
    const entries2 = entries(obj2);

    // This works because the returned tuple type is of a supertype of all key
    // names and the value type (which we don't care about for this flow check).
    const [_]: ["a" | "b" | "c", mixed] = entries2[0];

    // This errors because we try to get a key of only one type.
    // $FlowExpectedError[incompatible-type]
    const [__]: ["a", mixed] = entries2[0];
}

{
    // should type returned array element as tuples of values as supertype
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    };

    const entries1 = entries(obj1);

    // This works because the keys are all strings, and the values are a
    // supertype of all the value types in the object.
    const [_, __]: [string, number | string | Array<number>] = entries1[0];

    // This errors because not all values are a number.
    // $FlowExpectedError[incompatible-type]
    const [___, ____]: [string, number] = entries1[0];
}
