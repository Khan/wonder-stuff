// NOTE(@somewhatabstract): Crafted from looking at the TypeScript types and
// editing to match the Jest flow types for maintenance clarity.

declare module "jest-when" {
    declare type WhenMock<TArguments: $ReadOnlyArray<any>, TReturn> = {
        ...$Exact<JestMockFn<TArguments, TReturn>>,
        calledWith(...matchers: TArguments): WhenMock<TArguments, TReturn>;
        expectCalledWith(...matchers: TArguments): WhenMock<TArguments, TReturn>;
        mockReturnValue(value: TReturn): WhenMock<TArguments, TReturn>;
        mockReturnValueOnce(value: TReturn): WhenMock<TArguments, TReturn>;
        mockResolvedValue(value: TReturn): WhenMock<TArguments, TReturn>;
        mockResolvedValueOnce(value: TReturn): WhenMock<TArguments, TReturn>;
        mockRejectedValue(value: TReturn): WhenMock<TArguments, TReturn>;
        mockRejectedValueOnce(value: TReturn): WhenMock<TArguments, TReturn>;
        mockImplementation(fn: (...args: TArguments) => TReturn): WhenMock<TArguments, TReturn>;
        mockImplementationOnce(fn?: (...args: TArguments) => TReturn): WhenMock<TArguments, TReturn>;
    }

    declare type When = <TArguments: $ReadOnlyArray<any>, TReturn>(
        fn: ((...args: TArguments) => TReturn) | JestMockFn<TArguments, TReturn>,
    ) => WhenMock<TArguments, TReturn>;

    declare module.exports: {
        when: When,
        resetAllWhenMocks: () => void,
        verifyAllWhenMocksCalled: () => void,
    }
}
