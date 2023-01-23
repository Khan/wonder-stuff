// @flow
import {dataFactoryFor} from "../data-factory-for";

describe("dataFactoryFor", () => {
    describe("returns a function that", () => {
        it("should return a clone of the default data", () => {
            const BASE_OBJECT = {x: 5, y: 10};

            const dataFactory = dataFactoryFor(BASE_OBJECT);

            const data = dataFactory();
            expect(data).toEqual(BASE_OBJECT);
            expect(data).not.toBe(BASE_OBJECT);
        });

        it("should merge object passed to factory with the base object", () => {
            const BASE_OBJECT = {x: 5, y: 10};

            const dataFactory = dataFactoryFor(BASE_OBJECT);

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
            };

            const dataFactory = dataFactoryFor(BASE_OBJECT);

            const p = {x: 20, y: 30};
            const data = dataFactory({p});
            data.p.x = 100;

            expect(p).toEqual({x: 20, y: 30});
        });
    });
});
