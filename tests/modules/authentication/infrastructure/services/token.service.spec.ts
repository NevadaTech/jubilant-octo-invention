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

const EXPIRES_KEY = "nevada_token_expires";
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
        const parts = val.split(";");
        const nameValue = parts[0].trim();
        const maxAgePart = parts.find((p) => p.trim().startsWith("max-age="));
        const maxAge = maxAgePart
          ? parseInt(maxAgePart.split("=")[1].trim(), 10)
          : null;

        if (maxAge === 0) {
          const name = nameValue.split("=")[0];
          cookieStr = cookieStr
            .split(";")
            .filter((c) => !c.trim().startsWith(`${name}=`))
            .join("; ")
            .trim();
        } else {
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

  describe("setExpiresAt / getTokenExpiry", () => {
    it("Given: an expiry string When: setting and getting Then: should round-trip correctly", () => {
      const expiresAt = "2026-12-31T23:59:59.000Z";
      TokenService.setExpiresAt(expiresAt);

      const result = TokenService.getTokenExpiry();
      expect(result).toBeInstanceOf(Date);
      expect(result!.toISOString()).toBe(expiresAt);
    });

    it("Given: no expiry stored When: calling getTokenExpiry Then: should return null", () => {
      const result = TokenService.getTokenExpiry();
      expect(result).toBeNull();
    });
  });

  describe("setTokens (legacy)", () => {
    it("Given: valid tokens When: calling setTokens Then: should store expiry", () => {
      const expiresAt = new Date(Date.now() + 3600000).toISOString();
      TokenService.setTokens({
        accessToken: "access-tok",
        refreshToken: "refresh-tok",
        expiresAt,
      });

      expect(localStorage.setItem).toHaveBeenCalledWith(EXPIRES_KEY, expiresAt);
    });
  });

  describe("getAccessToken / getRefreshToken (legacy)", () => {
    it("Given: HttpOnly cookie setup When: calling getAccessToken Then: should return null (tokens in HttpOnly cookies)", () => {
      const result = TokenService.getAccessToken();
      expect(result).toBeNull();
    });

    it("Given: HttpOnly cookie setup When: calling getRefreshToken Then: should return null (tokens in HttpOnly cookies)", () => {
      const result = TokenService.getRefreshToken();
      expect(result).toBeNull();
    });
  });

  describe("isTokenExpired", () => {
    it("Given: token expiry in the past When: calling isTokenExpired Then: should return true", () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      store[EXPIRES_KEY] = pastDate;

      const result = TokenService.isTokenExpired();
      expect(result).toBe(true);
    });

    it("Given: token expiry in the future When: calling isTokenExpired Then: should return false", () => {
      const futureDate = new Date(Date.now() + 3600000).toISOString();
      store[EXPIRES_KEY] = futureDate;

      const result = TokenService.isTokenExpired();
      expect(result).toBe(false);
    });

    it("Given: no expiry stored When: calling isTokenExpired Then: should return true", () => {
      const result = TokenService.isTokenExpired();
      expect(result).toBe(true);
    });
  });

  describe("isTokenAboutToExpire", () => {
    it("Given: token expiring within threshold When: calling isTokenAboutToExpire Then: should return true", () => {
      const soonDate = new Date(Date.now() + 30000).toISOString();
      store[EXPIRES_KEY] = soonDate;

      const result = TokenService.isTokenAboutToExpire();
      expect(result).toBe(true);
    });

    it("Given: token not expiring within threshold When: calling isTokenAboutToExpire Then: should return false", () => {
      const laterDate = new Date(Date.now() + 7200000).toISOString();
      store[EXPIRES_KEY] = laterDate;

      const result = TokenService.isTokenAboutToExpire();
      expect(result).toBe(false);
    });

    it("Given: custom threshold and token near expiry When: calling isTokenAboutToExpire Then: should respect custom threshold", () => {
      const fiveMinutes = new Date(Date.now() + 5 * 60000).toISOString();
      store[EXPIRES_KEY] = fiveMinutes;

      const result = TokenService.isTokenAboutToExpire(10 * 60000);
      expect(result).toBe(true);
    });

    it("Given: no expiry stored When: calling isTokenAboutToExpire Then: should return true", () => {
      const result = TokenService.isTokenAboutToExpire();
      expect(result).toBe(true);
    });
  });

  describe("clearSession / clearTokens", () => {
    it("Given: session data stored When: calling clearSession Then: should remove all session keys from localStorage", () => {
      store[EXPIRES_KEY] = "2026-12-31T00:00:00Z";
      store[ORG_SLUG_KEY] = "my-org";
      store[ORG_ID_KEY] = "org-1";
      store[USER_KEY] = JSON.stringify(sampleUser);

      TokenService.clearSession();

      expect(localStorage.removeItem).toHaveBeenCalledWith(EXPIRES_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(ORG_SLUG_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(ORG_ID_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    });

    it("Given: session data stored When: calling clearTokens (legacy) Then: should also clear session", () => {
      store[EXPIRES_KEY] = "2026-12-31T00:00:00Z";
      store[ORG_SLUG_KEY] = "my-org";

      TokenService.clearTokens();

      expect(localStorage.removeItem).toHaveBeenCalledWith(EXPIRES_KEY);
      expect(localStorage.removeItem).toHaveBeenCalledWith(ORG_SLUG_KEY);
    });
  });

  describe("setUser / getUser", () => {
    it("Given: a user object When: setting and getting user Then: should round-trip correctly", () => {
      TokenService.setUser(sampleUser);
      const result = TokenService.getUser();
      expect(result).toEqual(sampleUser);
    });

    it("Given: no user stored When: calling getUser Then: should return null", () => {
      const result = TokenService.getUser();
      expect(result).toBeNull();
    });

    it("Given: a user with optional fields undefined When: round-tripping Then: should preserve structure", () => {
      const minimalUser: StoredUser = {
        id: "user-2",
        email: "jane@example.com",
        username: "janedoe",
        firstName: "Jane",
        lastName: "Doe",
        roles: [],
        permissions: [],
      };

      TokenService.setUser(minimalUser);
      const result = TokenService.getUser();

      expect(result).toEqual(minimalUser);
      expect(result!.phone).toBeUndefined();
      expect(result!.timezone).toBeUndefined();
    });

    it("Given: invalid JSON in localStorage When: calling getUser Then: should return null", () => {
      store[USER_KEY] = "not-json";
      const result = TokenService.getUser();
      expect(result).toBeNull();
    });

    it("Given: invalid user shape in localStorage When: calling getUser Then: should return null and clear", () => {
      store[USER_KEY] = JSON.stringify({ invalid: true });
      const result = TokenService.getUser();
      expect(result).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith(USER_KEY);
    });
  });

  describe("setOrganizationSlug / getOrganizationSlug", () => {
    it("Given: an org slug When: setting and getting Then: should round-trip correctly", () => {
      TokenService.setOrganizationSlug("my-company");
      const result = TokenService.getOrganizationSlug();
      expect(result).toBe("my-company");
    });

    it("Given: no org slug stored When: calling getOrganizationSlug Then: should return null", () => {
      const result = TokenService.getOrganizationSlug();
      expect(result).toBeNull();
    });
  });

  describe("setOrganizationId / getOrganizationId", () => {
    it("Given: an org id When: setting and getting Then: should round-trip correctly", () => {
      TokenService.setOrganizationId("org-42");
      const result = TokenService.getOrganizationId();
      expect(result).toBe("org-42");
    });

    it("Given: no org id stored When: calling getOrganizationId Then: should return null", () => {
      const result = TokenService.getOrganizationId();
      expect(result).toBeNull();
    });
  });

  describe("hasValidToken / hasValidSession", () => {
    it("Given: valid expiry and user stored When: calling hasValidSession Then: should return true", () => {
      store[EXPIRES_KEY] = new Date(Date.now() + 3600000).toISOString();
      store[USER_KEY] = JSON.stringify(sampleUser);

      const result = TokenService.hasValidSession();
      expect(result).toBe(true);
    });

    it("Given: no session data When: calling hasValidSession Then: should return false", () => {
      const result = TokenService.hasValidSession();
      expect(result).toBe(false);
    });

    it("Given: expired session When: calling hasValidToken Then: should return false", () => {
      store[EXPIRES_KEY] = new Date(Date.now() - 60000).toISOString();
      store[USER_KEY] = JSON.stringify(sampleUser);

      const result = TokenService.hasValidToken();
      expect(result).toBe(false);
    });
  });

  describe("extractOrgIdFromToken", () => {
    it("Given: HttpOnly cookie setup When: calling extractOrgIdFromToken Then: should return null", () => {
      const result = TokenService.extractOrgIdFromToken();
      expect(result).toBeNull();
    });
  });
});
