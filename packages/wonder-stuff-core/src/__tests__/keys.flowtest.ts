// @ts-expect-error [FEI-5011] - TS2307 - Cannot find module '../keys' or its corresponding type declarations.
import {keys} from "../keys";

{
    // should type returned array element as subtype of string
    const obj1 = {
        a: 1,
        b: "2",
    } as const;

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

    // This works because the return type is an array of a supertype of all key
    // names, thanks to $Keys<>.
    const keys2ok = keys(obj2);
    const _: "a" | "b" | "c" = keys2ok[0];

    // This errors because we try to get a key of only one type. Flow sees this
    // as a bad call rather than a bad assignment. Hence the expectation on
    // the callsite, not the assignment.
    const keys2bad = keys(obj2);
    const __: "a" = keys2bad[0];
}

{
    // should work with more specific object types
    const obj3: {
        [key: string]: string;
    } = {
        a: "1",
        b: "2",
    };

    // This should not be erroring.
    const _ = keys(obj3);
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
    const _ = keys(foo);
}
