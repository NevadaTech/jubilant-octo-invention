import { describe, it, expect } from "vitest";
import {
  AuthApiError,
  getAuthErrorCode,
} from "@/modules/authentication/infrastructure/errors/auth-api.error";

describe("AuthApiError", () => {
  describe("constructor", () => {
    it("Given message, code, and statusCode, When constructed, Then sets all properties correctly", () => {
      const error = new AuthApiError(
        "Invalid credentials",
        "unauthorized",
        401,
      );

      expect(error.message).toBe("Invalid credentials");
      expect(error.code).toBe("unauthorized");
      expect(error.statusCode).toBe(401);
      expect(error.name).toBe("AuthApiError");
    });

    it("Given an AuthApiError instance, When checked with instanceof Error, Then returns true", () => {
      const error = new AuthApiError("Forbidden", "forbidden", 403);

      expect(error).toBeInstanceOf(Error);
    });

    it("Given an AuthApiError instance, When checked with instanceof AuthApiError, Then returns true", () => {
      const error = new AuthApiError("Server error", "serverError", 500);

      expect(error).toBeInstanceOf(AuthApiError);
    });
  });
});

describe("getAuthErrorCode", () => {
  it("Given statusCode 401, When called without error string, Then returns 'unauthorized'", () => {
    const result = getAuthErrorCode(401);

    expect(result).toBe("unauthorized");
  });

  it("Given statusCode 403, When called without error string, Then returns 'forbidden'", () => {
    const result = getAuthErrorCode(403);

    expect(result).toBe("forbidden");
  });

  it("Given statusCode 500, When called without error string, Then returns 'serverError'", () => {
    const result = getAuthErrorCode(500);

    expect(result).toBe("serverError");
  });

  it("Given statusCode 502, When called without error string, Then returns 'serverError'", () => {
    const result = getAuthErrorCode(502);

    expect(result).toBe("serverError");
  });

  it("Given statusCode 400, When called without error string, Then returns 'generic'", () => {
    const result = getAuthErrorCode(400);

    expect(result).toBe("generic");
  });

  it("Given statusCode 404, When called without error string, Then returns 'generic'", () => {
    const result = getAuthErrorCode(404);

    expect(result).toBe("generic");
  });

  it("Given error string 'Unauthorized' (case-insensitive), When called, Then returns 'unauthorized'", () => {
    const result = getAuthErrorCode(200, "Unauthorized");

    expect(result).toBe("unauthorized");
  });

  it("Given error string 'forbidden', When called, Then returns 'forbidden'", () => {
    const result = getAuthErrorCode(200, "forbidden");

    expect(result).toBe("forbidden");
  });

  it("Given statusCode 200 with no error string, When called, Then returns 'generic'", () => {
    const result = getAuthErrorCode(200);

    expect(result).toBe("generic");
  });
});
