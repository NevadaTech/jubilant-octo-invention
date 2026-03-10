import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { createQueryWrapper } from "@tests/utils/create-query-wrapper";

// Use vi.hoisted to avoid temporal dead zone with vi.mock hoisting
const { mockRequestPasswordReset, mockVerifyOtp, mockResetPassword } =
  vi.hoisted(() => ({
    mockRequestPasswordReset: vi.fn(),
    mockVerifyOtp: vi.fn(),
    mockResetPassword: vi.fn(),
  }));

vi.mock("@/config/di/container", () => ({
  getContainer: () => ({
    authRepository: {
      requestPasswordReset: mockRequestPasswordReset,
      verifyOtp: mockVerifyOtp,
      resetPassword: mockResetPassword,
    },
  }),
}));

import {
  useRequestPasswordReset,
  useVerifyOtp,
  useResetPassword,
} from "@/modules/authentication/presentation/hooks/use-password-reset";

describe("use-password-reset hooks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── useRequestPasswordReset ─────────────────────────────────────────

  describe("useRequestPasswordReset", () => {
    it("Given: valid data When: mutating Then: should call authRepository.requestPasswordReset", async () => {
      mockRequestPasswordReset.mockResolvedValueOnce({
        success: true,
        message: "OTP sent",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "test@example.com",
        organizationSlug: "acme",
      });
    });

    it("Given: server error When: mutating Then: should set isError to true", async () => {
      mockRequestPasswordReset.mockRejectedValueOnce(new Error("Server error"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("Given: hook is idle When: checking state Then: isPending should be false", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useRequestPasswordReset(), {
        wrapper: Wrapper,
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });

  // ── useVerifyOtp ────────────────────────────────────────────────────

  describe("useVerifyOtp", () => {
    it("Given: valid OTP data When: mutating Then: should call authRepository.verifyOtp", async () => {
      mockVerifyOtp.mockResolvedValueOnce({
        success: true,
        message: "Verified",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useVerifyOtp(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          otpCode: "123456",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: "test@example.com",
        otpCode: "123456",
        organizationSlug: "acme",
      });
    });

    it("Given: invalid OTP When: mutating Then: should set isError to true", async () => {
      mockVerifyOtp.mockRejectedValueOnce(new Error("Invalid code"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useVerifyOtp(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          otpCode: "000000",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  // ── useResetPassword ────────────────────────────────────────────────

  describe("useResetPassword", () => {
    it("Given: valid reset data When: mutating Then: should call authRepository.resetPassword", async () => {
      mockResetPassword.mockResolvedValueOnce({
        success: true,
        message: "Password reset",
      });
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          otpCode: "123456",
          newPassword: "NewP@ss123",
          confirmPassword: "NewP@ss123",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(mockResetPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        otpCode: "123456",
        newPassword: "NewP@ss123",
        confirmPassword: "NewP@ss123",
        organizationSlug: "acme",
      });
    });

    it("Given: server rejects reset When: mutating Then: should set isError to true", async () => {
      mockResetPassword.mockRejectedValueOnce(new Error("OTP expired"));
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: Wrapper,
      });

      await act(async () => {
        result.current.mutate({
          email: "test@example.com",
          otpCode: "123456",
          newPassword: "NewP@ss123",
          confirmPassword: "NewP@ss123",
          organizationSlug: "acme",
        });
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toBeInstanceOf(Error);
    });

    it("Given: hook is idle When: checking state Then: isPending should be false", () => {
      const { Wrapper } = createQueryWrapper();

      const { result } = renderHook(() => useResetPassword(), {
        wrapper: Wrapper,
      });

      expect(result.current.isPending).toBe(false);
    });
  });
});
