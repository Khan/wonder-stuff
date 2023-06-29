import arrayTypeStyle from "./array-type-style";
import jestAsyncUseRealTimers from "./jest-async-use-real-timers";
import jestAwaitAsyncMatchers from "./jest-await-async-matchers";
import noOneTuple from "./no-one-tuple";
import reactNoMethodJsxAttribute from "./react-no-method-jsx-attribute";
import reactNoSubscriptionsBeforeMount from "./react-no-subscriptions-before-mount";
import reactSvgPathPrecision from "./react-svg-path-precision";
import syncTag from "./sync-tag";
import tsNoErrorSupressions from "./ts-no-error-suppressions";

import flowArrayTypeStyle from "./flow-array-type-style";
import flowExactProps from "./flow-exact-props";
import flowExactState from "./flow-exact-state";
import flowNoOneTuple from "./flow-no-one-tuple";
import importsRequiringFlow from "./imports-requiring-flow";
import jestEnzymeMatchers from "./jest-enzyme-matchers";

export default {
    "array-type-style": arrayTypeStyle,
    "jest-async-use-real-timers": jestAsyncUseRealTimers,
    "jest-await-async-matchers": jestAwaitAsyncMatchers,
    "no-one-tuple": noOneTuple,
    "ts-no-error-suppressions": tsNoErrorSupressions,
    "react-no-method-jsx-attribute": reactNoMethodJsxAttribute,
    "react-no-subscriptions-before-mount": reactNoSubscriptionsBeforeMount,
    "react-svg-path-precision": reactSvgPathPrecision,
    "sync-tag": syncTag,

    "flow-array-type-style": flowArrayTypeStyle,
    "flow-exact-props": flowExactProps,
    "flow-exact-state": flowExactState,
    "flow-no-one-tuple": flowNoOneTuple,
    "imports-requiring-flow": importsRequiringFlow,
    "jest-enzyme-matchers": jestEnzymeMatchers,
};
