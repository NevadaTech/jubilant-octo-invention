import { env } from "@/config/env";

interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

const TOKEN_KEY = env.NEXT_PUBLIC_AUTH_COOKIE_NAME;
const REFRESH_TOKEN_KEY = env.NEXT_PUBLIC_REFRESH_COOKIE_NAME;
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
  roles: string[];
  permissions: string[];
}

function isClient(): boolean {
  return typeof window !== "undefined";
}

function isSecureContext(): boolean {
  return isClient() && window.location.protocol === "https:";
}

function secureCookieFlag(): string {
  return isSecureContext() ? "; Secure" : "";
}

export class TokenService {
  static setTokens(tokens: StoredTokens): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(TOKEN_KEY, tokens.accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
      localStorage.setItem(`${TOKEN_KEY}_expires`, tokens.expiresAt);

      // Sync with cookie for middleware auth check
      document.cookie = `${TOKEN_KEY}=${tokens.accessToken}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secureCookieFlag()}`;
    } catch (error) {
      console.error("Failed to store tokens:", error);
    }
  }

  /**
   * Reads access token from cookie (fallback when localStorage is not ready or empty).
   * Used so requests after client navigation always have the token.
   */
  static getAccessTokenFromCookie(): string | null {
    if (!isClient() || typeof document?.cookie !== "string") return null;
    try {
      const name = `${TOKEN_KEY}=`;
      const decoded = decodeURIComponent(document.cookie);
      const parts = decoded.split(";");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed.startsWith(name)) {
          const value = trimmed.slice(name.length).trim();
          return value || null;
        }
      }
      return null;
    } catch {
      return null;
    }
  }

  static getAccessToken(): string | null {
    if (!isClient()) return null;

    try {
      const fromStorage = localStorage.getItem(TOKEN_KEY);
      if (fromStorage) return fromStorage;
      // Fallback: use cookie (e.g. after login + route change before rehydration)
      const fromCookie = this.getAccessTokenFromCookie();
      if (fromCookie) {
        localStorage.setItem(TOKEN_KEY, fromCookie);
        return fromCookie;
      }
      return null;
    } catch {
      return this.getAccessTokenFromCookie();
    }
  }

  static getRefreshToken(): string | null {
    if (!isClient()) return null;

    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static getTokenExpiry(): Date | null {
    if (!isClient()) return null;

    try {
      const expiresAt = localStorage.getItem(`${TOKEN_KEY}_expires`);
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

  static clearTokens(): void {
    if (!isClient()) return;

    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(`${TOKEN_KEY}_expires`);
      localStorage.removeItem(ORG_SLUG_KEY);
      localStorage.removeItem(ORG_ID_KEY);
      localStorage.removeItem(USER_KEY);

      // Clear auth cookie
      document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax${secureCookieFlag()}`;
    } catch (error) {
      console.error("Failed to clear tokens:", error);
    }
  }

  static setUser(user: StoredUser): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error("Failed to store user:", error);
    }
  }

  static getUser(): StoredUser | null {
    if (!isClient()) return null;

    try {
      const userStr = localStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static setOrganizationSlug(slug: string): void {
    if (!isClient()) return;

    try {
      localStorage.setItem(ORG_SLUG_KEY, slug);
    } catch (error) {
      console.error("Failed to store organization slug:", error);
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
      console.error("Failed to store organization id:", error);
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

  static extractOrgIdFromToken(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.org_id || null;
    } catch {
      return null;
    }
  }

  static hasValidToken(): boolean {
    const token = this.getAccessToken();
    if (!token) return false;
    return !this.isTokenExpired();
  }
}
