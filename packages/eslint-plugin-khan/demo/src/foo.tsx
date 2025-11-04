import * as React from "react";

function addStyle(str: string) {
    // Placeholder example for calling addStyle for aphrodite
}

// This sync-tag is wrong so that the lint error shows.
// Don't fix it.
// sync-start:foo-bar 911 src/bar.ts
const div = addStyle("div");
// sync-end:foo-bar

export const Icon = (): React.ReactNode => {
    return (
        <svg>
            <path d="M0.123456,0.123456L5,10Z" />
        </svg>
    );
};
