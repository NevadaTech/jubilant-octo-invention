import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthApiAdapter } from "@/modules/authentication/infrastructure/adapters/auth-api.adapter";
import { AuthApiError } from "@/modules/authentication/infrastructure/errors/auth-api.error";

// --- Mocks ---

vi.mock("@/config/env", () => ({
  env: {
    NEXT_PUBLIC_API_URL: "http://localhost:8080",
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  },
}));

const mockSetUser = vi.fn();
const mockSetAccessToken = vi.fn();
const mockSetOrganizationSlug = vi.fn();
const mockSetExpiresAt = vi.fn();
const mockGetOrganizationSlug = vi.fn();
const mockClearSession = vi.fn();
const mockIsTokenExpired = vi.fn();
const mockGetUser = vi.fn();

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      setUser: (...args: unknown[]) => mockSetUser(...args),
      setAccessToken: (...args: unknown[]) => mockSetAccessToken(...args),
      setOrganizationSlug: (...args: unknown[]) =>
        mockSetOrganizationSlug(...args),
      setExpiresAt: (...args: unknown[]) => mockSetExpiresAt(...args),
      getOrganizationSlug: () => mockGetOrganizationSlug(),
      clearSession: () => mockClearSession(),
      isTokenExpired: () => mockIsTokenExpired(),
      getUser: () => mockGetUser(),
      setTokens: vi.fn(),
      clearTokens: () => mockClearSession(),
      getAccessToken: vi.fn().mockReturnValue(null),
      getRefreshToken: vi.fn().mockReturnValue(null),
      setOrganizationId: vi.fn(),
      extractOrgIdFromToken: vi.fn().mockReturnValue(null),
    },
  }),
);

vi.mock("@/modules/authentication/infrastructure/mappers/user.mapper", () => ({
  UserMapper: {
    toDomain: (dto: Record<string, unknown>) => ({
      id: dto.id,
      email: dto.email,
      username: dto.username,
    }),
  },
}));

// --- Helpers ---

// BFF login response (refreshToken stripped, accessToken included for direct backend calls)
const mockBffLoginResponse = {
  success: true,
  message: "Login successful",
  data: {
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock-access-token",
    user: {
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      roles: ["ADMIN"],
      permissions: ["PRODUCTS:READ"],
    },
    accessTokenExpiresAt: "2026-12-31T23:59:59.000Z",
    refreshTokenExpiresAt: "2027-01-31T23:59:59.000Z",
    sessionId: "session-1",
  },
  timestamp: "2026-03-02T00:00:00.000Z",
};

// --- Tests ---

describe("AuthApiAdapter", () => {
  let adapter: AuthApiAdapter;

  beforeEach(() => {
    adapter = new AuthApiAdapter();
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockBffLoginResponse),
      }),
    );
  });

  describe("login", () => {
    it("Given: valid credentials When: login is called Then: should POST to BFF /api/auth/login", async () => {
      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/auth/login",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            organizationSlug: "acme",
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );
    });

    it("Given: successful login When: response is OK Then: should store accessToken, user, and org slug via TokenService", async () => {
      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockSetAccessToken).toHaveBeenCalledWith(
        mockBffLoginResponse.data.accessToken,
      );
      expect(mockSetUser).toHaveBeenCalledWith(mockBffLoginResponse.data.user);
      expect(mockSetOrganizationSlug).toHaveBeenCalledWith("acme");
      expect(mockSetExpiresAt).toHaveBeenCalledWith("2026-12-31T23:59:59.000Z");
    });

    it("Given: invalid credentials When: response is 401 Then: should throw AuthApiError", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () =>
            Promise.resolve({
              message: "Invalid credentials",
              error: "Unauthorized",
              statusCode: 401,
            }),
        }),
      );

      await expect(
        adapter.login({
          organizationSlug: "acme",
          email: "bad@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow(AuthApiError);
    });

    it("Given: server error When: response fails to parse JSON Then: should throw AuthApiError with generic message", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error("not JSON")),
        }),
      );

      await expect(
        adapter.login({
          organizationSlug: "acme",
          email: "test@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Authentication failed");
    });
  });

  describe("logout", () => {
    it("Given: a logged-in user When: logout is called Then: should POST to BFF and clear session", async () => {
      mockGetOrganizationSlug.mockReturnValue("acme");
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
      );

      await adapter.logout();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/auth/logout",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
      expect(mockClearSession).toHaveBeenCalled();
    });

    it("Given: logout API fails When: fetch throws Then: should still clear session via finally", async () => {
      mockGetOrganizationSlug.mockReturnValue(null);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      await expect(adapter.logout()).rejects.toThrow("Network error");

      expect(mockClearSession).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("Given: expired session When: getCurrentUser is called Then: should return null", async () => {
      mockIsTokenExpired.mockReturnValue(true);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it("Given: valid session but no stored user When: getCurrentUser is called Then: should return null", async () => {
      mockIsTokenExpired.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it("Given: valid session and stored user When: getCurrentUser is called Then: should return mapped user", async () => {
      mockIsTokenExpired.mockReturnValue(false);
      mockGetUser.mockReturnValue({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
      });

      const user = await adapter.getCurrentUser();

      expect(user).toEqual({
        id: "user-1",
        email: "test@example.com",
        username: "testuser",
      });
    });
  });

  describe("refreshToken", () => {
    it("Given: valid session When: refreshToken is called Then: should POST to BFF /api/auth/refresh and store new accessToken", async () => {
      mockGetOrganizationSlug.mockReturnValue("acme");
      const refreshResponse = {
        success: true,
        data: {
          accessToken: "new-access-token",
          accessTokenExpiresAt: "2027-06-01T00:00:00.000Z",
        },
      };
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve(refreshResponse),
        }),
      );

      const tokens = await adapter.refreshToken();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:3000/api/auth/refresh",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
        }),
      );
      expect(mockSetAccessToken).toHaveBeenCalledWith("new-access-token");
      expect(mockSetExpiresAt).toHaveBeenCalledWith("2027-06-01T00:00:00.000Z");
      expect(tokens.accessToken).toBe("new-access-token");
    });

    it("Given: refresh fails When: response is not OK Then: should clear session and throw", async () => {
      mockGetOrganizationSlug.mockReturnValue(null);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      await expect(adapter.refreshToken()).rejects.toThrow(
        "Token refresh failed",
      );
      expect(mockClearSession).toHaveBeenCalled();
    });
  });
});
