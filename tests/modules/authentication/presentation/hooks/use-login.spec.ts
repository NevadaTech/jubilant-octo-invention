import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockLogin = vi.fn();
const mockClearError = vi.fn();
const mockPush = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/modules/authentication/presentation/store/auth.store", () => ({
  useAuthStore: (selector: (state: any) => any) => {
    const state = {
      login: mockLogin,
      clearError: mockClearError,
    };
    return selector(state);
  },
}));

let mockGetUser: ReturnType<typeof vi.fn> = vi.fn(() => null);

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      getUser: () => mockGetUser(),
    },
  }),
);

import { useLogin } from "@/modules/authentication/presentation/hooks/use-login";

describe("use-login hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Successful Login ───────────────────────────────────────────────

  describe("useLogin", () => {
    it("Given valid credentials, When login is called, Then it clears error, calls login, and redirects to dashboard", async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      mockGetUser.mockReturnValue(null);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.loginAsync({
          email: "user@example.com",
          password: "password123",
        });
      });

      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "password123",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("Given user must change password, When login succeeds, Then it redirects to change-password", async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      mockGetUser.mockReturnValue({ mustChangePassword: true });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.loginAsync({
          email: "user@example.com",
          password: "password123",
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/change-password");
    });

    it("Given user does not need to change password, When login succeeds, Then it redirects to dashboard", async () => {
      mockLogin.mockResolvedValueOnce(undefined);
      mockGetUser.mockReturnValue({ mustChangePassword: false });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.loginAsync({
          email: "user@example.com",
          password: "password123",
        });
      });

      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });

    it("Given invalid credentials, When login is called, Then it rejects and does not redirect", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Invalid credentials"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        try {
          await result.current.loginAsync({
            email: "bad@example.com",
            password: "wrong",
          });
        } catch {
          // expected
        }
      });

      expect(mockClearError).toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("Given the hook is idle, When checking isLoading, Then it returns false", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("Given a failed login, When checking isError, Then it returns true after mutation settles", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Login failed"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        result.current.login({
          email: "user@example.com",
          password: "wrong",
        });
      });

      // Wait for the mutation to settle
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("Given a failed login, When calling reset, Then it clears the error state", async () => {
      mockLogin.mockRejectedValueOnce(new Error("Login failed"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogin(), { wrapper: Wrapper });

      await act(async () => {
        result.current.login({
          email: "user@example.com",
          password: "wrong",
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      act(() => {
        result.current.reset();
      });

      await waitFor(() => expect(result.current.isError).toBe(false));
      expect(result.current.error).toBeNull();
    });
  });
});
