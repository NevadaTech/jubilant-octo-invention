import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

let mockMutate: ReturnType<typeof vi.fn>;
let mockIsPending: boolean;

vi.mock("@/modules/settings/presentation/hooks/use-change-password", () => ({
  useChangePassword: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

import { ChangePasswordForm } from "@/modules/settings/presentation/components/change-password-form";

describe("ChangePasswordForm", () => {
  beforeEach(() => {
    mockMutate = vi.fn();
    mockIsPending = false;
  });

  it("Given: form loaded When: rendering Then: should show the title", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("title")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show the description", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("description")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show current password label", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("currentPassword")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show new password label", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("newPassword")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show confirm password label", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("confirmPassword")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show password requirements text", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("requirements")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should show the submit button", () => {
    render(<ChangePasswordForm />);
    expect(screen.getByText("changePassword")).toBeInTheDocument();
  });

  it("Given: form loaded When: rendering Then: should render three password inputs", () => {
    render(<ChangePasswordForm />);
    const inputs = document.querySelectorAll("input[type='password']");
    expect(inputs.length).toBe(3);
  });

  it("Given: form loaded When: rendering Then: should have current-password autocomplete on first input", () => {
    render(<ChangePasswordForm />);
    const input = document.getElementById("currentPassword");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("autocomplete")).toBe("current-password");
  });

  it("Given: form loaded When: rendering Then: should have new-password autocomplete on new password input", () => {
    render(<ChangePasswordForm />);
    const input = document.getElementById("newPassword");
    expect(input).not.toBeNull();
    expect(input?.getAttribute("autocomplete")).toBe("new-password");
  });

  it("Given: mutation is pending When: rendering Then: should disable the submit button", () => {
    mockIsPending = true;
    render(<ChangePasswordForm />);
    const button = screen.getByText("changePassword").closest("button");
    expect(button).toBeDisabled();
  });

  it("Given: mutation is not pending When: rendering Then: should enable the submit button", () => {
    mockIsPending = false;
    render(<ChangePasswordForm />);
    const button = screen.getByText("changePassword").closest("button");
    expect(button).not.toBeDisabled();
  });

  it("Given: form loaded When: rendering Then: should render a form element", () => {
    render(<ChangePasswordForm />);
    const form = document.querySelector("form");
    expect(form).not.toBeNull();
  });

  it("Given: form loaded When: rendering Then: should render inside a card container", () => {
    const { container } = render(<ChangePasswordForm />);
    const card = container.querySelector(".p-6");
    expect(card).not.toBeNull();
  });
});
