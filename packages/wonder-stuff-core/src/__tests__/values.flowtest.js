// @flow
import {values} from "../values";

{
    // should type returned array element with union of value types of passed object
    const obj1 = {
        a: 1,
        b: "2",
        c: [3, 4],
    };
    const obj1Values = values(obj1);

    // This works because the variable is typed to all the possible value types.
    const _: number | string | Array<number> = obj1Values[0];

    // This errors because the variable is only typed to string, but the value
    // could be a number, string, or array of numbers.
    // $FlowExpectedError[incompatible-type]
    const __: string = obj1Values[1];
}

{
    // should work with explicit object-as-map types
    const map1: {|[string]: number|} = {
        a: 1,
        b: 2,
        c: 3,
    };
    const map1Values = values(map1);

    // This works because the variable is typed to number.
    const _: number = map1Values[0];

    // This errors because the variable is typed to string, and that is not
    // a number.
    // $FlowExpectedError[incompatible-type]
    const __: string = map1Values[1];
}

{
    // should return type Array<empty> for empty object
    const emptyObj = {};
    const _: Array<empty> = values(emptyObj);
}

{
    // should error if passed object values do not match parameterized type
    const obj2 = {
        a: 1,
        b: "2",
    };

    // This errors because the return type of values() is not Array<number>
    // $FlowExpectedError[incompatible-type]
    const _: Array<number> = values(obj2);

    // This errors because the object does not have values that are all numbers.
    // $FlowExpectedError[incompatible-call]
    const __ = values<number>(obj2);
}

{
    // should work with class instances
    class Foo {
        a: string;
        b: string;
    }
    const foo = new Foo();

    // This should not be erroring.
    const _ = values(foo);
}
