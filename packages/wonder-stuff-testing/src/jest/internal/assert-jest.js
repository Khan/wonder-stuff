// @flow
import {KindError} from "@khanacademy/wonder-stuff-core";
import {Errors} from "../../errors.js";
import {isRunningInJest} from "./is-running-in-jest.js";

/**
 * Assert that we're running in jest.
 */
export const assertJest = () => {
    if (!isRunningInJest()) {
        /**
         * This file is for use in tests only.
         */
        throw new KindError(
            "Invalid import - for use in tests only",
            Errors.InvalidUse,
        );
    }
};
