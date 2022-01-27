// @flow
export const unverifiedWait = (delay: number, count: number): Promise<void> =>
    new Promise((resolve, reject) => {
        // eslint-disable-next-line no-restricted-syntax
        setTimeout(() => {
            if (count > 1) {
                resolve(unverifiedWait(delay, count - 1));
            } else {
                resolve();
            }
        }, delay);
    });
