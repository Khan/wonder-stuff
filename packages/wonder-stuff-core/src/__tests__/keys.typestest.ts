import {keys} from "../keys";

{
    // should type returned array element as subtype of string
    const obj1 = {
        a: 1,
        b: "2",
    };

    const keys1 = keys(obj1);
    const _: string = keys1[0];
}

{
    // should type returned array element as supertype of keys
    const obj2 = {
        a: 1,
        b: "2",
        c: [3, 4],
    } as const;

    // It would be nice if this worked, but TypeScript's library definition
    // defines the return type of Object.keys() to be Array<string>.
    const keys2bad = keys(obj2);
    const _: "a" | "b" | "c" = keys2bad[0];

    // @ts-expect-error: This errors because we try to get a key of only one type.
    const __: "a" = keys2bad[0];
}

{
    // should work with more specific object types
    const obj3: Record<string, string> = {
        a: "1",
        b: "2",
    };

    // This should not be erroring.
    const _ = keys(obj3);
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
    const _ = keys(foo);
}
