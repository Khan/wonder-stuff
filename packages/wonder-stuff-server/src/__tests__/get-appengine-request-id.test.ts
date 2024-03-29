import {getAppEngineRequestID} from "../get-app-engine-request-id";

describe("#getAppEngineRequestID", () => {
    it("should return null when header is absent", () => {
        // Arrange
        const request = {
            header: jest.fn(),
        } as any;

        // Act
        const result = getAppEngineRequestID(request);

        // Assert
        expect(result).toBeNull();
    });

    it("should return the requestID when it does not end with 000101xx", () => {
        // Arrange
        const request = {
            header: jest.fn((key: any) =>
                key === "X-Appengine-Request-Log-Id"
                    ? "this-is-a-good-request-id"
                    : null,
            ),
        } as any;

        // Act
        const result = getAppEngineRequestID(request);

        // Assert
        expect(result).toBe("this-is-a-good-request-id");
    });

    it("should return a fixed requestID when it does end with 000101xx", () => {
        // Arrange
        const request = {
            header: jest.fn((key: any) =>
                key === "X-Appengine-Request-Log-Id"
                    ? "this-is-a-bad-request-id-000101BD"
                    : null,
            ),
        } as any;

        // Act
        const result = getAppEngineRequestID(request);

        // Assert
        expect(result).toBe("this-is-a-bad-request-id-000100");
    });
});
