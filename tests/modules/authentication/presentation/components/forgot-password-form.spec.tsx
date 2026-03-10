import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

const mockRequestReset = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
};
const mockVerifyOtp = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
};
const mockResetPassword = {
  mutate: vi.fn(),
  isPending: false,
  error: null,
};

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (params) {
      return `${key}(${JSON.stringify(params)})`;
    }
    return key;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

vi.mock(
  "@/modules/authentication/presentation/hooks/use-password-reset",
  () => ({
    useRequestPasswordReset: () => mockRequestReset,
    useVerifyOtp: () => mockVerifyOtp,
    useResetPassword: () => mockResetPassword,
  }),
);

import { ForgotPasswordForm } from "@/modules/authentication/presentation/components/forgot-password-form";

describe("ForgotPasswordForm", () => {
  // ── Email Step (default) ────────────────────────────────────────────

  it("Given: initial render When: on email step Then: should show title and description", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("title")).toBeDefined();
    expect(screen.getByText("description")).toBeDefined();
  });

  it("Given: initial render When: on email step Then: should show organization input", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("organization")).toBeDefined();
    const input = document.getElementById("organizationSlug");
    expect(input).not.toBeNull();
  });

  it("Given: initial render When: on email step Then: should show email input", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("enterEmail")).toBeDefined();
    const input = document.getElementById("resetEmail");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("Given: initial render When: on email step Then: should show submit button with sendCode text", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("sendCode")).toBeDefined();
  });

  it("Given: initial render When: on email step Then: should show back to login link", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText("backToLogin")).toBeDefined();
  });

  it("Given: not pending When: on email step Then: submit button should not be disabled", () => {
    render(<ForgotPasswordForm />);
    const btn = screen.getByText("sendCode").closest("button");
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });

  it("Given: requestReset is pending When: on email step Then: submit button should be disabled and show loading text", () => {
    mockRequestReset.isPending = true;
    render(<ForgotPasswordForm />);
    expect(screen.getByText("sending")).toBeDefined();
    const btn = screen.getByText("sending").closest("button");
    expect(btn!.disabled).toBe(true);
    mockRequestReset.isPending = false;
  });

  it("Given: requestReset has error When: on email step Then: should show error message", () => {
    mockRequestReset.error = new Error("Email not found");
    render(<ForgotPasswordForm />);
    expect(screen.getByText("Email not found")).toBeDefined();
    mockRequestReset.error = null;
  });

  it("Given: requestReset has non-Error error When: on email step Then: should show fallback text", () => {
    mockRequestReset.error = "Some string error";
    render(<ForgotPasswordForm />);
    // Fallback is t("description")
    const descriptions = screen.getAllByText("description");
    expect(descriptions.length).toBeGreaterThanOrEqual(2);
    mockRequestReset.error = null;
  });

  it("Given: initial render When: on email step Then: should render form element", () => {
    render(<ForgotPasswordForm />);
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
  });

  it("Given: no error When: on email step Then: should not show error div", () => {
    render(<ForgotPasswordForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv).toBeNull();
  });
});
