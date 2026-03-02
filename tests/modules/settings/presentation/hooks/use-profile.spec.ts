import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockGetProfile = vi.fn();
const mockUpdateProfile = vi.fn();
const mockSetUser = vi.fn();
const mockGetUser = vi.fn();
const mockSetState = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    settingsRepository: {
      getProfile: (...args: any[]) => mockGetProfile(...args),
      updateProfile: (...args: any[]) => mockUpdateProfile(...args),
      getAlertConfiguration: vi.fn(),
      updateAlertConfiguration: vi.fn(),
    },
  }),
}));

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      getUser: () => mockGetUser(),
      setUser: (...args: any[]) => mockSetUser(...args),
    },
  }),
);

vi.mock(
  "@/modules/authentication/infrastructure/mappers/user.mapper",
  () => ({
    UserMapper: {
      toDomain: (data: any) => data,
    },
  }),
);

vi.mock("@/modules/authentication/presentation/store/auth.store", () => {
  const fn = (selector: (state: any) => any) => {
    const state = { user: null, isAuthenticated: true };
    return selector(state);
  };
  fn.setState = (...args: any[]) => mockSetState(...args);
  return { useAuthStore: fn };
});

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  useProfile,
  useUpdateProfile,
} from "@/modules/settings/presentation/hooks/use-profile";
import { toast } from "sonner";

describe("use-profile hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockReturnValue({
      id: "u-1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
    });
  });

  // ── useProfile ─────────────────────────────────────────────────────

  describe("useProfile", () => {
    it("Given a profile exists, When the hook fetches, Then it returns the profile data via select", async () => {
      const profileResponse = {
        data: {
          id: "u-1",
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          phone: "+1234567890",
          timezone: "America/New_York",
        },
      };
      mockGetProfile.mockResolvedValueOnce(profileResponse);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useProfile(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetProfile).toHaveBeenCalled();
      // The select transform extracts .data from the response
      expect(result.current.data).toEqual(profileResponse.data);
    });

    it("Given a server error, When the hook fetches, Then it reports the error", async () => {
      mockGetProfile.mockRejectedValueOnce(new Error("Unauthorized"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useProfile(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ── useUpdateProfile ───────────────────────────────────────────────

  describe("useUpdateProfile", () => {
    it("Given valid data, When mutate is called, Then it updates the profile, updates stored user, and shows success toast", async () => {
      const updatedResponse = {
        data: {
          firstName: "Jane",
          lastName: "Doe",
          phone: "+1234567890",
          timezone: "America/Chicago",
          language: "en",
          jobTitle: "Manager",
          department: "Sales",
        },
      };
      mockUpdateProfile.mockResolvedValueOnce(updatedResponse);
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({ firstName: "Jane" });
      });

      expect(mockUpdateProfile).toHaveBeenCalledWith({ firstName: "Jane" });
      expect(toast.success).toHaveBeenCalledWith("saved");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["profile"],
      });

      // Check that TokenService.setUser was called to persist changes
      expect(mockSetUser).toHaveBeenCalled();
      // Check that auth store was updated
      expect(mockSetState).toHaveBeenCalled();
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ firstName: "Fail" });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalledWith("errorSaving");
    });
  });
});
