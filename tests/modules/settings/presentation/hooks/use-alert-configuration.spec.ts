import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockGetAlertConfiguration = vi.fn();
const mockUpdateAlertConfiguration = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    settingsRepository: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      getAlertConfiguration: (...args: any[]) =>
        mockGetAlertConfiguration(...args),
      updateAlertConfiguration: (...args: any[]) =>
        mockUpdateAlertConfiguration(...args),
    },
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import {
  useAlertConfiguration,
  useUpdateAlertConfiguration,
} from "@/modules/settings/presentation/hooks/use-alert-configuration";
import { toast } from "sonner";

describe("use-alert-configuration hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useAlertConfiguration ──────────────────────────────────────────

  describe("useAlertConfiguration", () => {
    it("Given alert configuration exists, When the hook fetches, Then it returns the config data", async () => {
      const configResponse = {
        data: {
          cronFrequency: "EVERY_HOUR",
          notifyLowStock: true,
          notifyCriticalStock: true,
          notifyOutOfStock: false,
          recipientEmails: ["admin@example.com"],
          isEnabled: true,
        },
      };
      mockGetAlertConfiguration.mockResolvedValueOnce(configResponse);
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAlertConfiguration(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockGetAlertConfiguration).toHaveBeenCalled();
      // The select transform extracts .data from the response
      expect(result.current.data).toEqual(configResponse.data);
    });

    it("Given a server error, When the hook fetches, Then it reports the error", async () => {
      mockGetAlertConfiguration.mockRejectedValueOnce(new Error("Forbidden"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useAlertConfiguration(), {
        wrapper: Wrapper,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  // ── useUpdateAlertConfiguration ────────────────────────────────────

  describe("useUpdateAlertConfiguration", () => {
    it("Given valid data, When mutate is called, Then it updates and shows success toast", async () => {
      mockUpdateAlertConfiguration.mockResolvedValueOnce({
        data: { isEnabled: true, cronFrequency: "EVERY_6_HOURS" },
      });
      const { Wrapper, queryClient } = createQueryWrapper();
      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useUpdateAlertConfiguration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.mutateAsync({
          isEnabled: true,
          cronFrequency: "EVERY_6_HOURS",
        });
      });

      expect(mockUpdateAlertConfiguration).toHaveBeenCalledWith({
        isEnabled: true,
        cronFrequency: "EVERY_6_HOURS",
      });
      expect(toast.success).toHaveBeenCalledWith("saved");
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["alert-configuration"],
      });
    });

    it("Given a server error, When mutate is called, Then it shows error toast", async () => {
      mockUpdateAlertConfiguration.mockRejectedValueOnce(new Error("Fail"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useUpdateAlertConfiguration(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        try {
          await result.current.mutateAsync({ isEnabled: false });
        } catch {
          // expected
        }
      });

      expect(toast.error).toHaveBeenCalled();
    });
  });
});
