import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthApiAdapter } from "@/modules/authentication/infrastructure/adapters/auth-api.adapter";
import { AuthApiError } from "@/modules/authentication/infrastructure/errors/auth-api.error";

// --- Mocks ---

vi.mock("@/config/env", () => ({
  env: { NEXT_PUBLIC_API_URL: "http://localhost:8080" },
}));

const mockSetTokens = vi.fn();
const mockSetUser = vi.fn();
const mockSetOrganizationSlug = vi.fn();
const mockSetOrganizationId = vi.fn();
const mockExtractOrgIdFromToken = vi.fn().mockReturnValue("org-123");
const mockGetAccessToken = vi.fn();
const mockGetOrganizationSlug = vi.fn();
const mockClearTokens = vi.fn();
const mockIsTokenExpired = vi.fn();
const mockGetUser = vi.fn();

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      setTokens: (...args: unknown[]) => mockSetTokens(...args),
      setUser: (...args: unknown[]) => mockSetUser(...args),
      setOrganizationSlug: (...args: unknown[]) =>
        mockSetOrganizationSlug(...args),
      setOrganizationId: (...args: unknown[]) => mockSetOrganizationId(...args),
      extractOrgIdFromToken: () => mockExtractOrgIdFromToken(),
      getAccessToken: () => mockGetAccessToken(),
      getOrganizationSlug: () => mockGetOrganizationSlug(),
      clearTokens: () => mockClearTokens(),
      isTokenExpired: () => mockIsTokenExpired(),
      getUser: () => mockGetUser(),
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

const mockLoginResponse = {
  success: true,
  message: "Login successful",
  data: {
    user: {
      id: "user-1",
      email: "test@example.com",
      username: "testuser",
      firstName: "Test",
      lastName: "User",
      roles: ["ADMIN"],
      permissions: ["PRODUCTS:READ"],
    },
    accessToken: "access-token-123",
    refreshToken: "refresh-token-456",
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
        json: () => Promise.resolve(mockLoginResponse),
      }),
    );
  });

  describe("login", () => {
    it("Given: valid credentials When: login is called Then: should POST to /auth/login with correct headers and body", async () => {
      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            "X-Organization-Slug": "acme",
          }),
          body: JSON.stringify({
            email: "test@example.com",
            password: "password123",
          }),
        }),
      );
    });

    it("Given: successful login When: response is OK Then: should store tokens and user via TokenService", async () => {
      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: "access-token-123",
        refreshToken: "refresh-token-456",
        expiresAt: "2026-12-31T23:59:59.000Z",
      });
      expect(mockSetUser).toHaveBeenCalledWith(mockLoginResponse.data.user);
      expect(mockSetOrganizationSlug).toHaveBeenCalledWith("acme");
    });

    it("Given: successful login When: JWT contains org_id Then: should store organization id", async () => {
      mockExtractOrgIdFromToken.mockReturnValue("org-456");

      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockSetOrganizationId).toHaveBeenCalledWith("org-456");
    });

    it("Given: successful login When: JWT has no org_id Then: should not call setOrganizationId", async () => {
      mockExtractOrgIdFromToken.mockReturnValue(null);

      await adapter.login({
        organizationSlug: "acme",
        email: "test@example.com",
        password: "password123",
      });

      expect(mockSetOrganizationId).not.toHaveBeenCalled();
    });

    it("Given: invalid credentials When: response is 401 Then: should throw AuthApiError with unauthorized code", async () => {
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

      await expect(
        adapter.login({
          organizationSlug: "acme",
          email: "bad@example.com",
          password: "wrong",
        }),
      ).rejects.toMatchObject({
        code: "unauthorized",
        statusCode: 401,
      });
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
    it("Given: a logged-in user When: logout is called Then: should POST to /auth/logout and clear tokens", async () => {
      mockGetAccessToken.mockReturnValue("token-abc");
      mockGetOrganizationSlug.mockReturnValue("acme");
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue({ ok: true, json: () => Promise.resolve({}) }),
      );

      await adapter.logout();

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/logout",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Authorization: "Bearer token-abc",
            "X-Organization-Slug": "acme",
          }),
        }),
      );
      expect(mockClearTokens).toHaveBeenCalled();
    });

    it("Given: logout API fails When: fetch throws Then: should still clear tokens via finally", async () => {
      mockGetAccessToken.mockReturnValue("token-abc");
      mockGetOrganizationSlug.mockReturnValue(null);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockRejectedValue(new Error("Network error")),
      );

      // logout re-throws after clearing tokens in finally block
      await expect(adapter.logout()).rejects.toThrow("Network error");

      expect(mockClearTokens).toHaveBeenCalled();
    });
  });

  describe("getCurrentUser", () => {
    it("Given: no access token When: getCurrentUser is called Then: should return null", async () => {
      mockGetAccessToken.mockReturnValue(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it("Given: expired token When: getCurrentUser is called Then: should return null", async () => {
      mockGetAccessToken.mockReturnValue("expired-token");
      mockIsTokenExpired.mockReturnValue(true);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it("Given: valid token but no stored user When: getCurrentUser is called Then: should return null", async () => {
      mockGetAccessToken.mockReturnValue("valid-token");
      mockIsTokenExpired.mockReturnValue(false);
      mockGetUser.mockReturnValue(null);

      const user = await adapter.getCurrentUser();

      expect(user).toBeNull();
    });

    it("Given: valid token and stored user When: getCurrentUser is called Then: should return mapped user", async () => {
      mockGetAccessToken.mockReturnValue("valid-token");
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
    it("Given: valid refresh token When: refreshToken is called Then: should POST to /auth/refresh and update stored tokens", async () => {
      mockGetOrganizationSlug.mockReturnValue("acme");
      const refreshResponse = {
        data: {
          accessToken: "new-access",
          refreshToken: "new-refresh",
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

      const tokens = await adapter.refreshToken("old-refresh-token");

      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:8080/auth/refresh",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Organization-Slug": "acme",
          }),
          body: JSON.stringify({ refreshToken: "old-refresh-token" }),
        }),
      );
      expect(mockSetTokens).toHaveBeenCalledWith({
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresAt: "2027-06-01T00:00:00.000Z",
      });
      expect(tokens.accessToken).toBe("new-access");
      expect(tokens.refreshToken).toBe("new-refresh");
    });

    it("Given: refresh fails When: response is not OK Then: should clear tokens and throw", async () => {
      mockGetOrganizationSlug.mockReturnValue(null);
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      await expect(adapter.refreshToken("bad-token")).rejects.toThrow(
        "Token refresh failed",
      );
      expect(mockClearTokens).toHaveBeenCalled();
    });
  });
});
