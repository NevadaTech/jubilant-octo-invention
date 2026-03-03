import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/modules/authentication/presentation/components/login-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
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
  usePathname: () => "/login",
  redirect: vi.fn(),
}));

vi.mock("@/modules/authentication/presentation/hooks/use-login", () => ({
  useLogin: () => ({ login: vi.fn(), isLoading: false, error: null }),
}));

describe("LoginForm", () => {
  it("Given: login page When: rendering Then: should show organization field", () => {
    render(<LoginForm />);
    expect(screen.getByText("organization")).toBeDefined();
  });

  it("Given: login page When: rendering Then: should show email field", () => {
    render(<LoginForm />);
    expect(screen.getByText("email")).toBeDefined();
  });

  it("Given: login page When: rendering Then: should show password field", () => {
    render(<LoginForm />);
    expect(screen.getByText("password")).toBeDefined();
  });

  it("Given: login page When: rendering Then: should show submit button", () => {
    render(<LoginForm />);
    expect(screen.getByText("submit")).toBeDefined();
  });

  it("Given: login page When: not loading Then: should not disable submit button", () => {
    render(<LoginForm />);
    const submitButton = screen.getByText("submit");
    expect(submitButton.closest("button")).not.toBeDisabled();
  });

  it("Given: login page When: rendering Then: should show organization input with correct id", () => {
    render(<LoginForm />);
    const input = document.getElementById("organizationSlug");
    expect(input).toBeDefined();
    expect(input?.tagName.toLowerCase()).toBe("input");
  });

  it("Given: login page When: rendering Then: should show email input with correct type", () => {
    render(<LoginForm />);
    const input = document.getElementById("email");
    expect(input).toBeDefined();
    expect(input?.getAttribute("type")).toBe("email");
  });

  it("Given: login page When: rendering Then: should show password input with correct type", () => {
    render(<LoginForm />);
    const input = document.getElementById("password");
    expect(input).toBeDefined();
    expect(input?.getAttribute("type")).toBe("password");
  });

  it("Given: login page When: no error Then: should not show error message", () => {
    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv).toBeNull();
  });

  it("Given: login page When: rendering Then: should render form element", () => {
    render(<LoginForm />);
    const form = document.querySelector("form");
    expect(form).toBeDefined();
    expect(form).not.toBeNull();
  });
});
