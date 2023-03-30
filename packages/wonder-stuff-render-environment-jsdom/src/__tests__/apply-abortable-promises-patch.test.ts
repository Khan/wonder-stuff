import {applyAbortablePromisesPatch} from "../apply-abortable-promises-patch";

describe("#applyAbortablePromisesPatch", () => {
    afterEach(() => {
        // @ts-expect-error We know promise doesn't usually have this
        delete Promise.prototype.abort;
    });

    it("should add an abort method to the promise prototype", () => {
        // Arrange

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBeFunction();
    });

    it("should replace any existing abort method on the promise prototype", () => {
        // Arrange
        // @ts-expect-error We know promise doesn't usually have this
        Promise.prototype.abort = "ABORT_FN";

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBeFunction();
    });

    it("should not delete the existing function if it was applied by us", () => {
        // Arrange
        applyAbortablePromisesPatch();
        // @ts-expect-error We know promise doesn't usually have this
        const abortFn = Promise.prototype.abort;

        // Act
        applyAbortablePromisesPatch();
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).toBe(abortFn);
    });

    it("should delete the existing function if it was applied by us and force is true", () => {
        // Arrange
        applyAbortablePromisesPatch();
        // @ts-expect-error We know promise doesn't usually have this
        const abortFn = Promise.prototype.abort;

        // Act
        applyAbortablePromisesPatch(true);
        const result: any = Promise.resolve();

        // Assert
        expect(result.abort).not.toBe(abortFn);
        expect(result.abort).toBeFunction();
    });
});
