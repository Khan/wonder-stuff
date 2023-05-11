/* eslint-disable @typescript-eslint/no-unused-vars */
import {isTruthy, isNonNullable} from "../type-predicates";

const array = [0, 5, false, true, "", "hello", undefined, null];

const truthyArray: Array<string | number | true> = array.filter(isTruthy);

const nonNullableArray: Array<string | number | boolean> =
    array.filter(isNonNullable);
