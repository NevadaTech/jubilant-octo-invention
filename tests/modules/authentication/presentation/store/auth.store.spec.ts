import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { User } from "@/modules/authentication/domain/entities/user";
import { Tokens } from "@/modules/authentication/domain/value-objects/tokens";

// Use vi.hoisted to avoid temporal dead zone with vi.mock hoisting
const { mockAuthRepository, mockTokenService } = vi.hoisted(() => ({
  mockAuthRepository: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
  },
  mockTokenService: {
    hasValidToken: vi.fn(),
    isTokenAboutToExpire: vi.fn(),
    getRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
    setTokens: vi.fn(),
    setUser: vi.fn(),
    getAccessToken: vi.fn(),
  },
}));

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({ authRepository: mockAuthRepository }),
}));

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: mockTokenService,
  }),
);

import { useAuthStore } from "@/modules/authentication/presentation/store/auth.store";
import { TokenService } from "@/modules/authentication/infrastructure/services/token.service";

const { getState, setState } = useAuthStore;

function resetStore(): void {
  setState({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    isHydrated: false,
    error: null,
  });
}

function createTestUser(): User {
  return User.create({
    id: "user-1",
    email: "john@test.com",
    username: "johndoe",
    firstName: "John",
    lastName: "Doe",
    roles: ["ADMIN"],
    permissions: ["PRODUCTS:READ"],
  });
}

function createTestTokens(): Tokens {
  return Tokens.create(
    "access-token-xyz",
    "refresh-token-xyz",
    new Date(Date.now() + 3600000),
  );
}

describe("useAuthStore", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  describe("initial state", () => {
    it("Given: a fresh store When: reading state Then: should have correct defaults", () => {
      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.isHydrated).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("login", () => {
    it("Given: valid credentials When: login succeeds Then: should set user and isAuthenticated", async () => {
      const user = createTestUser();
      const tokens = createTestTokens();
      mockAuthRepository.login.mockResolvedValue({ user, tokens });

      await getState().login({
        organizationSlug: "test-org",
        email: "john@test.com",
        password: "password123",
      });

      const state = getState();
      expect(state.user).toBe(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("Given: valid credentials When: login starts Then: should set isLoading true and clear error", async () => {
      let resolveLogin!: (value: unknown) => void;
      mockAuthRepository.login.mockReturnValue(
        new Promise((resolve) => {
          resolveLogin = resolve;
        }),
      );
      setState({ error: "previous error" });

      const loginPromise = getState().login({
        organizationSlug: "test-org",
        email: "john@test.com",
        password: "password123",
      });

      expect(getState().isLoading).toBe(true);
      expect(getState().error).toBeNull();

      resolveLogin({ user: createTestUser(), tokens: createTestTokens() });
      await loginPromise;
    });

    it("Given: invalid credentials When: login fails Then: should set error and clear user", async () => {
      const errorMessage = "Invalid email or password";
      mockAuthRepository.login.mockRejectedValue(new Error(errorMessage));

      await expect(
        getState().login({
          organizationSlug: "test-org",
          email: "wrong@test.com",
          password: "wrongpass",
        }),
      ).rejects.toThrow(errorMessage);

      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    it("Given: non-Error rejection When: login fails Then: should set generic error message", async () => {
      mockAuthRepository.login.mockRejectedValue("network failure");

      await expect(
        getState().login({
          organizationSlug: "test-org",
          email: "john@test.com",
          password: "password123",
        }),
      ).rejects.toBe("network failure");

      expect(getState().error).toBe("Login failed");
    });
  });

  describe("logout", () => {
    it("Given: authenticated user When: logout succeeds Then: should clear user and authentication state", async () => {
      setState({
        user: createTestUser(),
        isAuthenticated: true,
        isHydrated: true,
      });
      mockAuthRepository.logout.mockResolvedValue(undefined);

      await getState().logout();

      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("Given: authenticated user When: logout API fails Then: should still clear local state", async () => {
      setState({
        user: createTestUser(),
        isAuthenticated: true,
      });
      mockAuthRepository.logout.mockRejectedValue(new Error("Network error"));

      // logout re-throws via try/finally
      await expect(getState().logout()).rejects.toThrow("Network error");

      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
    });
  });

  describe("forceLogout", () => {
    it("Given: authenticated user When: forceLogout called Then: should clear tokens and state without backend call", () => {
      setState({
        user: createTestUser(),
        isAuthenticated: true,
        isHydrated: true,
      });

      getState().forceLogout();

      expect(TokenService.clearTokens).toHaveBeenCalled();
      expect(mockAuthRepository.logout).not.toHaveBeenCalled();
      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe("hydrate", () => {
    it("Given: no valid token When: hydrating Then: should set isHydrated true without user", async () => {
      mockTokenService.hasValidToken.mockReturnValue(false);

      await getState().hydrate();

      const state = getState();
      expect(state.isHydrated).toBe(true);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });

    it("Given: valid non-expiring token When: hydrating Then: should set user from getCurrentUser", async () => {
      const user = createTestUser();
      mockTokenService.hasValidToken.mockReturnValue(true);
      mockTokenService.isTokenAboutToExpire.mockReturnValue(false);
      mockAuthRepository.getCurrentUser.mockResolvedValue(user);

      await getState().hydrate();

      const state = getState();
      expect(state.user).toBe(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isHydrated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it("Given: token about to expire with refresh token When: hydrating Then: should refresh before fetching user", async () => {
      const user = createTestUser();
      mockTokenService.hasValidToken.mockReturnValue(true);
      mockTokenService.isTokenAboutToExpire.mockReturnValue(true);
      mockTokenService.getRefreshToken.mockReturnValue("refresh-token-abc");
      mockAuthRepository.refreshToken.mockResolvedValue(createTestTokens());
      mockAuthRepository.getCurrentUser.mockResolvedValue(user);

      await getState().hydrate();

      expect(mockAuthRepository.refreshToken).toHaveBeenCalledWith(
        "refresh-token-abc",
      );
      expect(getState().user).toBe(user);
      expect(getState().isAuthenticated).toBe(true);
    });

    it("Given: valid token but getCurrentUser returns null When: hydrating Then: should clear tokens", async () => {
      mockTokenService.hasValidToken.mockReturnValue(true);
      mockTokenService.isTokenAboutToExpire.mockReturnValue(false);
      mockAuthRepository.getCurrentUser.mockResolvedValue(null);

      await getState().hydrate();

      expect(TokenService.clearTokens).toHaveBeenCalled();
      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it("Given: valid token but getCurrentUser throws When: hydrating Then: should clear tokens", async () => {
      mockTokenService.hasValidToken.mockReturnValue(true);
      mockTokenService.isTokenAboutToExpire.mockReturnValue(false);
      mockAuthRepository.getCurrentUser.mockRejectedValue(
        new Error("Network error"),
      );

      await getState().hydrate();

      expect(TokenService.clearTokens).toHaveBeenCalled();
      const state = getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isHydrated).toBe(true);
    });
  });

  describe("setHydrated", () => {
    it("Given: isHydrated is false When: setting to true Then: should update isHydrated", () => {
      getState().setHydrated(true);
      expect(getState().isHydrated).toBe(true);
    });
  });

  describe("clearError", () => {
    it("Given: an error in state When: clearing error Then: should set error to null", () => {
      setState({ error: "Something went wrong" });
      getState().clearError();
      expect(getState().error).toBeNull();
    });

    it("Given: no error in state When: clearing error Then: should remain null", () => {
      getState().clearError();
      expect(getState().error).toBeNull();
    });
  });
});
