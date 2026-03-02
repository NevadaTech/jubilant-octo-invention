import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockLogout = vi.fn();
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
      logout: mockLogout,
    };
    return selector(state);
  },
}));

import { useLogout } from "@/modules/authentication/presentation/hooks/use-logout";

describe("use-logout hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("useLogout", () => {
    it("Given an authenticated user, When logout is called, Then it calls logout and redirects to login", async () => {
      mockLogout.mockResolvedValueOnce(undefined);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.logoutAsync();
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("Given a logout failure, When logout is called, Then it does not redirect", async () => {
      mockLogout.mockRejectedValueOnce(new Error("Network error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

      await act(async () => {
        try {
          await result.current.logoutAsync();
        } catch {
          // expected
        }
      });

      expect(mockLogout).toHaveBeenCalled();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("Given the hook is idle, When checking isLoading, Then it returns false", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useLogout(), { wrapper: Wrapper });

      expect(result.current.isLoading).toBe(false);
    });
  });
});
