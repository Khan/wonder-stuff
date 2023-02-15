export const unverifiedWait = (delay: number, count: number): Promise<void> =>
    new Promise(
        (
            resolve: (result: Promise<undefined> | undefined) => void,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            reject: (error?: any) => void,
        ) => {
            // eslint-disable-next-line no-restricted-syntax
            setTimeout(() => {
                if (count > 1) {
                    // @ts-expect-error [FEI-5011] - TS2345 - Argument of type 'Promise<void>' is not assignable to parameter of type 'Promise<undefined>'.
                    resolve(unverifiedWait(delay, count - 1));
                } else {
                    // @ts-expect-error [FEI-5011] - TS2794 - Expected 1 arguments, but got 0. Did you forget to include 'void' in your type argument to 'Promise'?
                    resolve();
                }
            }, delay);
        },
    );
