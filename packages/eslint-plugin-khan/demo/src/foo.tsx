import * as React from "react";

function addStyle(str: string) {
    // Placeholder example for calling addStyle for aphrodite
}

// sync-start:foo-bar 1424803960 src/bar.ts
const div = addStyle("div");
// sync-end:foo-bar

export const Icon = (): React.ReactNode => {
    return (
        <svg>
            <path d="M0.123456,0.123456L5,10Z" />
        </svg>
    );
};
