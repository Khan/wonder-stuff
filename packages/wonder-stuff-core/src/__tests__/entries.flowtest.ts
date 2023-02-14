// @ts-expect-error [FEI-5011] - TS2307 - Cannot find module '../entries' or its corresponding type declarations.
import {entries} from "../entries";

{
    // should type returned array element as tuples of keys as string subtype
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    } as const;

    const entries1 = entries(obj1);

    // This works because the keys are all strings
    const [_]: [string, unknown] = entries1[0];
}

{
    // should type returned array element as tuples supertype of keys
    const obj2 = {
        a: 1,
        b: "2",
        c: [3, 4],
    } as const;
    const entries2 = entries(obj2);

    // This works because the returned tuple type is of a supertype of all key
    // names and the value type (which we don't care about for this flow check).
    const [_]: ["a" | "b" | "c", unknown] = entries2[0];

    // This errors because we try to get a key of only one type.
    const [__]: ["a", unknown] = entries2[0];
}

{
    // should type returned array element as tuples of values as supertype
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    } as const;

    const entries1 = entries(obj1);

    // This works because the keys are all strings, and the values are a
    // supertype of all the value types in the object.
    const [_, __]: [string, number | string | Array<number>] = entries1[0];

    // This errors because not all values are a number.
    const [___, ____]: [string, number] = entries1[0];
}

{
    // should work with class instances
    class Foo {
        // @ts-expect-error [FEI-5011] - TS2564 - Property 'a' has no initializer and is not definitely assigned in the constructor.
        a: string;
        // @ts-expect-error [FEI-5011] - TS2564 - Property 'b' has no initializer and is not definitely assigned in the constructor.
        b: string;
    }
    const foo = new Foo();

    // This should not be erroring.
    const _ = entries(foo);
}
