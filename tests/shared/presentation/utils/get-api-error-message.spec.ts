import { describe, it, expect, vi } from "vitest";
import { AxiosError } from "axios";
import { getApiErrorMessage } from "@/shared/presentation/utils/get-api-error-message";

describe("getApiErrorMessage", () => {
  const t = vi.fn();

  it("Given: AxiosError with errorCode and valid translation When: called Then: should return the translated message", () => {
    // Arrange
    const error = new AxiosError(
      "Request failed",
      "ERR",
      undefined,
      undefined,
      {
        data: { errorCode: "INVALID_CREDENTIALS", message: "Bad credentials" },
        status: 401,
        statusText: "Unauthorized",
        headers: {},
        config: {} as never,
      },
    );
    t.mockImplementation((key: string) =>
      key === "INVALID_CREDENTIALS" ? "Invalid username or password" : key,
    );

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("Invalid username or password");
  });

  it("Given: AxiosError with errorCode but no translation When: called Then: should fall back to API message", () => {
    // Arrange
    const error = new AxiosError(
      "Request failed",
      "ERR",
      undefined,
      undefined,
      {
        data: {
          errorCode: "SOME_UNKNOWN_CODE",
          message: "Something went wrong",
        },
        status: 500,
        statusText: "Internal Server Error",
        headers: {},
        config: {} as never,
      },
    );
    // next-intl returns the key itself when missing
    t.mockImplementation((key: string) => key);

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("Something went wrong");
  });

  it("Given: AxiosError with only message (no errorCode) When: called Then: should return the API message", () => {
    // Arrange
    const error = new AxiosError(
      "Request failed",
      "ERR",
      undefined,
      undefined,
      {
        data: { message: "Validation failed" },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      },
    );

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("Validation failed");
  });

  it("Given: AxiosError with no response data When: called Then: should return UNKNOWN_ERROR fallback", () => {
    // Arrange
    const error = new AxiosError("Network Error");
    t.mockImplementation((key: string) =>
      key === "UNKNOWN_ERROR" ? "An unknown error occurred" : key,
    );

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("An unknown error occurred");
  });

  it("Given: a non-Axios error with response.data shape When: called Then: should extract the message", () => {
    // Arrange
    const error = {
      response: {
        data: { message: "Custom error from non-axios" },
      },
    };
    t.mockImplementation((key: string) => key);

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("Custom error from non-axios");
  });

  it("Given: an unknown error type (string) When: called Then: should return UNKNOWN_ERROR fallback", () => {
    // Arrange
    t.mockImplementation((key: string) =>
      key === "UNKNOWN_ERROR" ? "Unknown error" : key,
    );

    // Act
    const result = getApiErrorMessage("some string error", t);

    // Assert
    expect(result).toBe("Unknown error");
  });

  it("Given: null error When: called Then: should return UNKNOWN_ERROR fallback", () => {
    // Arrange
    t.mockImplementation((key: string) =>
      key === "UNKNOWN_ERROR" ? "Unknown error" : key,
    );

    // Act
    const result = getApiErrorMessage(null, t);

    // Assert
    expect(result).toBe("Unknown error");
  });

  it("Given: a non-Axios error with response but no data When: called Then: should return UNKNOWN_ERROR fallback", () => {
    // Arrange
    const error = { response: {} };
    t.mockImplementation((key: string) =>
      key === "UNKNOWN_ERROR" ? "Unknown error" : key,
    );

    // Act
    const result = getApiErrorMessage(error, t);

    // Assert
    expect(result).toBe("Unknown error");
  });
});
