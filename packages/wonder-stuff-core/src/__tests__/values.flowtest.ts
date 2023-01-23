// @ts-expect-error - TS7016 - Could not find a declaration file for module '../values'. '/Users/kevinbarabash/khan/wonder-stuff/packages/wonder-stuff-core/src/values.js' implicitly has an 'any' type.
import {values} from "../values";

{
    // should type returned array element with union of value types of passed object
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    } as const;
    const obj1Values = values(obj1);

    // This works because the variable is typed to all the possible value types.
    const _: number | string | Array<number> = obj1Values[0];

    // This errors because the variable is only typed to string, but the value
    // could be a number, string, or array of numbers.
    const __: string = obj1Values[1];
}

{
    // should work with explicit object-as-map types
    const map1: {
        [key: string]: number
    } = {
        a: 1,
        b: 2,
        c: 3,
    };
    const map1Values = values(map1);

    // This works because the variable is typed to number.
    const _: number = map1Values[0];

    // This errors because the variable is typed to string, and that is not
    // a number.
    const __: string = map1Values[1];
}

{
    // should return type Array<empty> for empty object
    const emptyObj: Record<string, any> = {};
    const _: Array<never> = values(emptyObj);
}

{
    // should error if passed object values do not match parameterized type
    const obj2 = {
        a: 1,
        b: "2",
    } as const;

    // This errors because the return type of values() is not Array<number>
    const _: Array<number> = values(obj2);

    // This errors because the object does not have values that are all numbers.
    const __ = values<number>(obj2);
}

{
    // should work with class instances
    class Foo {
// @ts-expect-error - TS2564 - Property 'a' has no initializer and is not definitely assigned in the constructor.
        a: string;
// @ts-expect-error - TS2564 - Property 'b' has no initializer and is not definitely assigned in the constructor.
        b: string;
    }
    const foo = new Foo();

    // This should not be erroring.
    const _ = values(foo);
}
