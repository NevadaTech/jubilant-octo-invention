import { z } from "zod";
import { logger } from "@/shared/infrastructure/logger";

const ACCESS_TOKEN_KEY = "nevada_access_token";
const EXPIRES_KEY = "nevada_token_expires";
const ORG_SLUG_KEY = "nevada_org_slug";
const ORG_ID_KEY = "nevada_org_id";
const USER_KEY = "nevada_user";

export interface StoredUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  timezone?: string;
  language?: string;
  jobTitle?: string;
  department?: string;
  mustChangePassword?: boolean;
  roles: string[];
  permissions: string[];
  orgSettings?: {
    multiCompanyEnabled?: boolean;
    [key: string]: unknown;
  };
}

const storedUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  mustChangePassword: z.boolean().optional(),
  roles: z.array(z.string()),
  permissions: z.array(z.string()),
  orgSettings: z.record(z.string(), z.unknown()).optional(),
});

function isClient(): boolean {
  return typeof window !== "undefined";
}

function isSecureContext(): boolean {
  return isClient() && window.location.protocol === "https:";
}

function secureCookieFlag(): string {
  return isSecureContext() ? "; Secure" : "";
}

/**
 * TokenService — manages session metadata in localStorage.
 * Actual auth tokens are stored in HttpOnly cookies via the BFF API routes.
 * This service only stores: user data, org info, and token expiry timestamp.
 */
export class TokenService {
  static setExpiresAt(expiresAt: string): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(EXPIRES_KEY, expiresAt);
    } catch (error) {
      logger.error("Failed to store expiry:", error);
    }
  }

  static getTokenExpiry(): Date | null {
    if (!isClient()) return null;

    try {
      const expiresAt = localStorage.getItem(EXPIRES_KEY);
      return expiresAt ? new Date(expiresAt) : null;
    } catch {
      return null;
    }
  }

  static isTokenExpired(): boolean {
    const expiresAt = this.getTokenExpiry();
    if (!expiresAt) return true;
    return new Date() >= expiresAt;
  }

  static isTokenAboutToExpire(thresholdMs: number = 60000): boolean {
    const expiresAt = this.getTokenExpiry();
    if (!expiresAt) return true;
    const timeUntilExpiry = expiresAt.getTime() - Date.now();
    return timeUntilExpiry <= thresholdMs;
  }

  static hasValidSession(): boolean {
    return !this.isTokenExpired() && this.getUser() !== null;
  }

  /**
   * Clears all client-side session data.
   * HttpOnly cookies are cleared by calling the BFF logout route.
   */
  static clearSession(): void {
    if (!isClient()) return;

    try {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(EXPIRES_KEY);
      localStorage.removeItem(ORG_SLUG_KEY);
      localStorage.removeItem(ORG_ID_KEY);
      localStorage.removeItem(USER_KEY);

      // Clear non-auth cookies
      document.cookie = `nevada_must_change_pwd=; path=/; max-age=0; SameSite=Strict${secureCookieFlag()}`;
      document.cookie = `nevada_org_slug=; path=/; max-age=0; SameSite=Strict${secureCookieFlag()}`;
    } catch (error) {
      logger.error("Failed to clear session:", error);
    }
  }

  static setUser(user: StoredUser): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));

      // Sync mustChangePassword flag as cookie for proxy (server-side) access
      if (user.mustChangePassword) {
        document.cookie = `nevada_must_change_pwd=1; path=/; max-age=${60 * 30}; SameSite=Strict${secureCookieFlag()}`;
      } else {
        document.cookie = `nevada_must_change_pwd=; path=/; max-age=0; SameSite=Strict${secureCookieFlag()}`;
      }
    } catch (error) {
      logger.error("Failed to store user:", error);
    }
  }

  static getUser(): StoredUser | null {
    if (!isClient()) return null;

    try {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return null;
      const parsed = storedUserSchema.safeParse(JSON.parse(userStr));
      if (!parsed.success) {
        logger.warn("Invalid stored user data, clearing");
        localStorage.removeItem(USER_KEY);
        return null;
      }
      return parsed.data as StoredUser;
    } catch {
      return null;
    }
  }

  static setOrganizationSlug(slug: string): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(ORG_SLUG_KEY, slug);
      // Sync to cookie for server-side access (RSC prefetching)
      document.cookie = `nevada_org_slug=${encodeURIComponent(slug)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict${secureCookieFlag()}`;
    } catch (error) {
      logger.error("Failed to store organization slug:", error);
    }
  }

  static getOrganizationSlug(): string | null {
    if (!isClient()) return null;

    try {
      return localStorage.getItem(ORG_SLUG_KEY);
    } catch {
      return null;
    }
  }

  static setOrganizationId(orgId: string): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(ORG_ID_KEY, orgId);
    } catch (error) {
      logger.error("Failed to store organization id:", error);
    }
  }

  static getOrganizationId(): string | null {
    if (!isClient()) return null;

    try {
      return localStorage.getItem(ORG_ID_KEY);
    } catch {
      return null;
    }
  }

  /**
   * Access token is stored in localStorage for direct backend API calls.
   * Refresh token is NEVER stored client-side — it lives in HttpOnly cookies.
   */
  static setAccessToken(token: string): void {
    if (!isClient()) return;
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } catch (error) {
      logger.error("Failed to store access token:", error);
    }
  }

  static getAccessToken(): string | null {
    if (!isClient()) return null;
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static getRefreshToken(): string | null {
    // Refresh token is in HttpOnly cookie — not accessible from JS
    return null;
  }

  static setTokens(tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt: string;
  }): void {
    this.setAccessToken(tokens.accessToken);
    this.setExpiresAt(tokens.expiresAt);
  }

  static clearTokens(): void {
    this.clearSession();
  }

  static hasValidToken(): boolean {
    return this.hasValidSession();
  }

  static extractOrgIdFromToken(): string | null {
    // No longer accessible from client — tokens are HttpOnly
    return null;
  }
}
