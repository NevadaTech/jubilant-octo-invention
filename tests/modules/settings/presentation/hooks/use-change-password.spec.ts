import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

const mockChangePassword = vi.fn();

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    settingsRepository: {
      getProfile: vi.fn(),
      updateProfile: vi.fn(),
      getAlertConfiguration: vi.fn(),
      updateAlertConfiguration: vi.fn(),
      changePassword: (...args: any[]) => mockChangePassword(...args),
      getPickingConfig: vi.fn(),
      updatePickingConfig: vi.fn(),
    },
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { useChangePassword } from "@/modules/settings/presentation/hooks/use-change-password";
import { toast } from "sonner";

describe("useChangePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given valid data, When mutate is called, Then it calls changePassword and shows success toast", async () => {
    // Arrange
    const dto = {
      currentPassword: "OldPass123!",
      newPassword: "NewPass456@",
      confirmPassword: "NewPass456@",
    };
    mockChangePassword.mockResolvedValueOnce({
      success: true,
      message: "Password changed",
      data: { userId: "u-1" },
      timestamp: new Date().toISOString(),
    });
    const { Wrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync(dto);
    });

    // Assert
    expect(mockChangePassword).toHaveBeenCalledWith(dto);
    expect(toast.success).toHaveBeenCalledWith("changed");
  });

  it("Given a server error, When mutate is called, Then it shows error toast", async () => {
    // Arrange
    mockChangePassword.mockRejectedValueOnce(new Error("Unauthorized"));
    const { Wrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      try {
        await result.current.mutateAsync({
          currentPassword: "Wrong1!",
          newPassword: "NewPass456@",
          confirmPassword: "NewPass456@",
        });
      } catch {
        // expected
      }
    });

    // Assert
    expect(toast.error).toHaveBeenCalled();
  });

  it("Given the hook is idle, When inspected, Then isPending should be false", () => {
    // Arrange
    const { Wrapper } = createQueryWrapper();

    // Act
    const { result } = renderHook(() => useChangePassword(), {
      wrapper: Wrapper,
    });

    // Assert
    expect(result.current.isPending).toBe(false);
  });
});
