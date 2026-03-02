import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Mock @/config/env before importing TokenService, since it reads env at module level
vi.mock("@/config/env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "http://localhost:3000",
    NEXT_PUBLIC_APP_NAME: "Nevada Inventory System",
    NEXT_PUBLIC_API_URL: "http://localhost:8080",
    NEXT_PUBLIC_API_TIMEOUT: 30000,
    NEXT_PUBLIC_AUTH_COOKIE_NAME: "nevada_auth_token",
    NEXT_PUBLIC_REFRESH_COOKIE_NAME: "nevada_refresh_token",
    NEXT_PUBLIC_ENABLE_MOCK_API: false,
  },
}));

import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";
import type { StoredUser } from "@/modules/authentication/infrastructure/services/token.service";

const TOKEN_KEY = "nevada_auth_token";
const REFRESH_TOKEN_KEY = "nevada_refresh_token";
const ORG_SLUG_KEY = "nevada_org_slug";
const ORG_ID_KEY = "nevada_org_id";
const USER_KEY = "nevada_user";

describe("TokenService", () => {
  let store: Record<string, string>;

  beforeEach(() => {
    store = {};

    // Mock localStorage
    vi.stubGlobal("localStorage", {
      getItem: vi.fn((key: string) => store[key] ?? null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        store = {};
      }),
    });

    // Mock document.cookie
    let cookieStr = "";
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => cookieStr,
      set: (val: string) => {
        // Simple cookie set: parse name=value, handle max-age=0 as delete
        const parts = val.split(";");
        const nameValue = parts[0].trim();
        const maxAgePart = parts.find((p) => p.trim().startsWith("max-age="));
        const maxAge = maxAgePart
          ? parseInt(maxAgePart.split("=")[1].trim(), 10)
          : null;

        if (maxAge === 0) {
          // Delete cookie
          const name = nameValue.split("=")[0];
          cookieStr = cookieStr
            .split(";")
            .filter((c) => !c.trim().startsWith(`${name}=`))
            .join("; ")
            .trim();
        } else {
          // Add/update cookie
          const name = nameValue.split("=")[0];
          const existing = cookieStr
            .split(";")
            .filter((c) => c.trim() && !c.trim().startsWith(`${name}=`));
          existing.push(nameValue);
          cookieStr = existing.filter(Boolean).join("; ");
        }
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const sampleTokens = {
    accessToken:
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0Iiwib3JnX2lkIjoib3JnLTk5In0.sig",
    refreshToken: "refresh-token-abc-123",
    expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
  };

  const sampleUser: StoredUser = {
    id: "user-1",
    email: "john@example.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    phone: "+1234567890",
    timezone: "America/New_York",
    language: "en",
    jobTitle: "Manager",
    department: "Sales",
    roles: ["ADMIN"],
    permissions: ["USERS:CREATE", "SALES:READ"],
  };

  describe("setTokens", () => {
    it("Given: valid tokens When: calling setTokens Then: should store accessToken in localStorage", () => {
      // Arrange & Act
      TokenService.setTokens(sampleTokens);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        TOKEN_KEY,
        sampleTokens.accessToken,
      );
    });

    it("Given: valid tokens When: calling setTokens Then: should store refreshToken in localStorage", () => {
      // Arrange & Act
      TokenService.setTokens(sampleTokens);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        REFRESH_TOKEN_KEY,
        sampleTokens.refreshToken,
      );
    });

    it("Given: valid tokens When: calling setTokens Then: should store expiresAt in localStorage", () => {
      // Arrange & Act
      TokenService.setTokens(sampleTokens);

      // Assert
      expect(localStorage.setItem).toHaveBeenCalledWith(
        `${TOKEN_KEY}_expires`,
        sampleTokens.expiresAt,
      );
    });

    it("Given: valid tokens When: calling setTokens Then: should set cookie with accessToken", () => {
      // Arrange & Act
      TokenService.setTokens(sampleTokens);

      // Assert
      expect(document.cookie).toContain(sampleTokens.accessToken);
    });
  });

  describe("getAccessToken", () => {
    it("Given: token stored in localStorage When: calling getAccessToken Then: should return the token", () => {
      // Arrange
      store[TOKEN_KEY] = "my-access-token";

      // Act
      const result = TokenService.getAccessToken();

      // Assert
      expect(result).toBe("my-access-token");
    });

    it("Given: no token in storage When: calling getAccessToken Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getAccessToken();

      // Assert
      expect(result).toBeNull();
    });

    it("Given: token missing from localStorage but present in cookie When: calling getAccessToken Then: should fall back to cookie", () => {
      // Arrange - set cookie directly
      document.cookie = `${TOKEN_KEY}=cookie-token; path=/; max-age=3600`;

      // Act
      const result = TokenService.getAccessToken();

      // Assert
      expect(result).toBe("cookie-token");
    });
  });

  describe("getRefreshToken", () => {
    it("Given: refresh token stored When: calling getRefreshToken Then: should return the token", () => {
      // Arrange
      store[REFRESH_TOKEN_KEY] = "my-refresh-token";

      // Act
      const result = TokenService.getRefreshToken();

      // Assert
      expect(result).toBe("my-refresh-token");
    });

    it("Given: no refresh token When: calling getRefreshToken Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getRefreshToken();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("getTokenExpiry", () => {
    it("Given: expiry stored in localStorage When: calling getTokenExpiry Then: should return a Date", () => {
      // Arrange
      const expiresAt = "2026-12-31T23:59:59.000Z";
      store[`${TOKEN_KEY}_expires`] = expiresAt;

      // Act
      const result = TokenService.getTokenExpiry();

      // Assert
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe(expiresAt);
    });

    it("Given: no expiry stored When: calling getTokenExpiry Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getTokenExpiry();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("Given: token expiry in the past When: calling isTokenExpired Then: should return true", () => {
      // Arrange
      const pastDate = new Date(Date.now() - 60000).toISOString();
      store[`${TOKEN_KEY}_expires`] = pastDate;

      // Act
      const result = TokenService.isTokenExpired();

      // Assert
      expect(result).toBe(true);
    });

    it("Given: token expiry in the future When: calling isTokenExpired Then: should return false", () => {
      // Arrange
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      store[`${TOKEN_KEY}_expires`] = futureDate;

      // Act
      const result = TokenService.isTokenExpired();

      // Assert
      expect(result).toBe(false);
    });

    it("Given: no expiry stored When: calling isTokenExpired Then: should return true", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.isTokenExpired();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("isTokenAboutToExpire", () => {
    it("Given: token expiring within threshold When: calling isTokenAboutToExpire Then: should return true", () => {
      // Arrange - expires in 30 seconds (default threshold is 60s)
      const soonDate = new Date(Date.now() + 30000).toISOString();
      store[`${TOKEN_KEY}_expires`] = soonDate;

      // Act
      const result = TokenService.isTokenAboutToExpire();

      // Assert
      expect(result).toBe(true);
    });

    it("Given: token not expiring within threshold When: calling isTokenAboutToExpire Then: should return false", () => {
      // Arrange - expires in 2 hours (well beyond 60s threshold)
      const laterDate = new Date(Date.now() + 7200000).toISOString();
      store[`${TOKEN_KEY}_expires`] = laterDate;

      // Act
      const result = TokenService.isTokenAboutToExpire();

      // Assert
      expect(result).toBe(false);
    });

    it("Given: custom threshold and token near expiry When: calling isTokenAboutToExpire Then: should respect custom threshold", () => {
      // Arrange - expires in 5 minutes, threshold = 10 minutes
      const fiveMinutes = new Date(Date.now() + 5 * 60000).toISOString();
      store[`${TOKEN_KEY}_expires`] = fiveMinutes;

      // Act
      const result = TokenService.isTokenAboutToExpire(10 * 60000);

      // Assert
      expect(result).toBe(true);
    });

    it("Given: no expiry stored When: calling isTokenAboutToExpire Then: should return true", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.isTokenAboutToExpire();

      // Assert
      expect(result).toBe(true);
    });
  });

  describe("clearTokens", () => {
    it("Given: tokens and user data stored When: calling clearTokens Then: should remove all auth keys from localStorage", () => {
      // Arrange
      store[TOKEN_KEY] = "token";
      store[REFRESH_TOKEN_KEY] = "refresh";
      store[`${TOKEN_KEY}_expires`] = "2026-12-31T00:00:00Z";
      store[ORG_SLUG_KEY] = "my-org";
      store[ORG_ID_KEY] = "org-1";
      store[USER_KEY] = JSON.stringify(sampleUser);

      // Act
      TokenService.clearTokens();

      // Assert
      expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(
        `${TOKEN_KEY}_expires`,
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith(ORG_SLUG_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(ORG_ID_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    });
  });

  describe("setUser / getUser", () => {
    it("Given: a user object When: setting and getting user Then: should round-trip correctly", () => {
      // Arrange & Act
      TokenService.setUser(sampleUser);
      const result = TokenService.getUser();

      // Assert
      expect(result).toEqual(sampleUser);
    });

    it("Given: no user stored When: calling getUser Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getUser();

      // Assert
      expect(result).toBeNull();
    });

    it("Given: a user with optional fields undefined When: round-tripping Then: should preserve structure", () => {
      // Arrange
      const minimalUser: StoredUser = {
        id: "user-2",
        email: "jane@example.com",
        username: "janedoe",
        firstName: "Jane",
        lastName: "Doe",
        roles: [],
        permissions: [],
      };

      // Act
      TokenService.setUser(minimalUser);
      const result = TokenService.getUser();

      // Assert
      expect(result).toEqual(minimalUser);
      expect(result!.phone).toBeUndefined();
      expect(result!.timezone).toBeUndefined();
    });
  });

  describe("setOrganizationSlug / getOrganizationSlug", () => {
    it("Given: an org slug When: setting and getting Then: should round-trip correctly", () => {
      // Arrange & Act
      TokenService.setOrganizationSlug("my-company");
      const result = TokenService.getOrganizationSlug();

      // Assert
      expect(result).toBe("my-company");
    });

    it("Given: no org slug stored When: calling getOrganizationSlug Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getOrganizationSlug();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("setOrganizationId / getOrganizationId", () => {
    it("Given: an org id When: setting and getting Then: should round-trip correctly", () => {
      // Arrange & Act
      TokenService.setOrganizationId("org-42");
      const result = TokenService.getOrganizationId();

      // Assert
      expect(result).toBe("org-42");
    });

    it("Given: no org id stored When: calling getOrganizationId Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.getOrganizationId();

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("hasValidToken", () => {
    it("Given: valid non-expired token When: calling hasValidToken Then: should return true", () => {
      // Arrange
      store[TOKEN_KEY] = "valid-token";
      store[`${TOKEN_KEY}_expires`] = new Date(
        Date.now() + 3600000,
      ).toISOString();

      // Act
      const result = TokenService.hasValidToken();

      // Assert
      expect(result).toBe(true);
    });

    it("Given: no token stored When: calling hasValidToken Then: should return false", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.hasValidToken();

      // Assert
      expect(result).toBe(false);
    });

    it("Given: token that is expired When: calling hasValidToken Then: should return false", () => {
      // Arrange
      store[TOKEN_KEY] = "expired-token";
      store[`${TOKEN_KEY}_expires`] = new Date(
        Date.now() - 60000,
      ).toISOString();

      // Act
      const result = TokenService.hasValidToken();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("extractOrgIdFromToken", () => {
    it("Given: JWT with org_id claim When: calling extractOrgIdFromToken Then: should return the org_id", () => {
      // Arrange - Build a valid JWT with org_id in payload
      const payload = { sub: "1234", org_id: "org-99" };
      const base64Payload = btoa(JSON.stringify(payload));
      const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${base64Payload}.signature`;
      store[TOKEN_KEY] = fakeJwt;

      // Act
      const result = TokenService.extractOrgIdFromToken();

      // Assert
      expect(result).toBe("org-99");
    });

    it("Given: JWT without org_id claim When: calling extractOrgIdFromToken Then: should return null", () => {
      // Arrange
      const payload = { sub: "1234" };
      const base64Payload = btoa(JSON.stringify(payload));
      const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${base64Payload}.signature`;
      store[TOKEN_KEY] = fakeJwt;

      // Act
      const result = TokenService.extractOrgIdFromToken();

      // Assert
      expect(result).toBeNull();
    });

    it("Given: no token stored When: calling extractOrgIdFromToken Then: should return null", () => {
      // Arrange (empty store)

      // Act
      const result = TokenService.extractOrgIdFromToken();

      // Assert
      expect(result).toBeNull();
    });
  });
});
