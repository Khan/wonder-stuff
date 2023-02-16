import {dataFactoryFor} from "../data-factory-for";

describe("dataFactoryFor", () => {
    describe("returns a function that", () => {
        it("should return a clone of the default data", () => {
            const BASE_OBJECT = {x: 5, y: 10} as const;

            const dataFactory = dataFactoryFor(BASE_OBJECT);

            const data = dataFactory();
            expect(data).toEqual(BASE_OBJECT);
            expect(data).not.toBe(BASE_OBJECT);
        });

        it("should merge object passed to factory with the base object", () => {
            const BASE_OBJECT = {x: 5, y: 10} as const;

            const dataFactory = dataFactoryFor(BASE_OBJECT);

            // @ts-expect-error [FEI-5011] - TS2322 - Type '100' is not assignable to type '5 | undefined'.
            const data = dataFactory({x: 100});
            expect(data).toEqual({
                x: 100,
                y: 10,
            });
        });

        it("should return a copy of the merged data", () => {
            const BASE_OBJECT = {
                p: {x: 5, y: 10},
                q: {x: 0, y: 1},
            } as const;

            const dataFactory = dataFactoryFor(BASE_OBJECT);

            const p = {x: 20, y: 30} as const;
            // @ts-expect-error [FEI-5011] - TS2322 - Type '{ readonly x: 20; readonly y: 30; }' is not assignable to type '{ readonly x: 5; readonly y: 10; }'.
            const data = dataFactory({p});
            // @ts-expect-error [FEI-5011] - TS2540 - Cannot assign to 'x' because it is a read-only property.
            data.p.x = 100;

            expect(p).toEqual({x: 20, y: 30});
        });
    });
});
