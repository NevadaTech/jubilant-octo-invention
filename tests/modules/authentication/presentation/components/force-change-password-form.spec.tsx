import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock("@/modules/settings/presentation/hooks/use-change-password", () => ({
  useChangePassword: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

vi.mock(
  "@/modules/authentication/infrastructure/services/token.service",
  () => ({
    TokenService: {
      getUser: vi.fn(() => ({ mustChangePassword: true })),
      setUser: vi.fn(),
    },
  }),
);

import { ForceChangePasswordForm } from "@/modules/authentication/presentation/components/force-change-password-form";

describe("ForceChangePasswordForm", () => {
  it("Given: initial render When: rendering Then: should show warning banner", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("warning")).toBeDefined();
  });

  it("Given: initial render When: rendering Then: should show current password field", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("currentPassword")).toBeDefined();
    const input = document.getElementById("currentPassword");
    expect(input).not.toBeNull();
  });

  it("Given: initial render When: rendering Then: should show new password field", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("newPassword")).toBeDefined();
    const input = document.getElementById("newPassword");
    expect(input).not.toBeNull();
  });

  it("Given: initial render When: rendering Then: should show confirm password field", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("confirmPassword")).toBeDefined();
    const input = document.getElementById("confirmPassword");
    expect(input).not.toBeNull();
  });

  it("Given: initial render When: rendering Then: should show password requirements hint", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("requirements")).toBeDefined();
  });

  it("Given: not pending When: rendering Then: should show submit button with submit text", () => {
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("submit")).toBeDefined();
    const btn = screen.getByText("submit").closest("button");
    expect(btn!.disabled).toBe(false);
  });

  it("Given: mutation is pending When: rendering Then: should show submitting text and disable button", () => {
    mockIsPending = true;
    render(<ForceChangePasswordForm />);
    expect(screen.getByText("submitting")).toBeDefined();
    const btn = screen.getByText("submitting").closest("button");
    expect(btn!.disabled).toBe(true);
    mockIsPending = false;
  });

  it("Given: initial render When: rendering Then: should render form element", () => {
    render(<ForceChangePasswordForm />);
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
  });

  it("Given: initial render When: rendering Then: password inputs should have correct autocomplete attributes", () => {
    render(<ForceChangePasswordForm />);
    const currentPwd = document.getElementById("currentPassword");
    const newPwd = document.getElementById("newPassword");
    const confirmPwd = document.getElementById("confirmPassword");
    expect(currentPwd?.getAttribute("autocomplete")).toBe("current-password");
    expect(newPwd?.getAttribute("autocomplete")).toBe("new-password");
    expect(confirmPwd?.getAttribute("autocomplete")).toBe("new-password");
  });
});
