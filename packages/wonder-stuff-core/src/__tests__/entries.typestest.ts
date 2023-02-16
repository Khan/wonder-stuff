import {entries} from "../entries";

{
    // should type returned array element as tuples of keys as string subtype
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    };

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

    // It would be nice if this worked, but TypeScript's library definition
    // defines the first item in the tuples returned by Object.entries() to
    // be `string`s.
    // @ts-expect-error: "a" | "b" | "c" is not assignable to string
    const [_]: ["a" | "b" | "c", unknown] = entries2[0];

    // This errors because we try to get a key of only one type.
    // @ts-expect-error: "a" is not assignable to string
    const [__]: ["a", unknown] = entries2[0];
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

    // @ts-expect-error: This errors because not all values are a number.
    const [___, ____]: [string, number] = entries1[0];
}

{
    // should work with class instances
    class Foo {
        a: string;
        b: string;
        constructor(a: string, b: string) {
            this.a = a;
            this.b = b;
        }
    }
    const foo = new Foo("hello", "world");

    // This should not be erroring.
    const _ = entries(foo);
}
