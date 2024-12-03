import * as path from "path";

export {
    RuleTester,
    RunTests,
    InvalidTestCase,
    ValidTestCase,
    noFormat,
} from "@typescript-eslint/rule-tester";

function getFixturesRootDir(): string {
    return path.join(__dirname, "fixtures");
}

export {getFixturesRootDir};
