import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "@/modules/authentication/presentation/components/login-form";
import { AuthApiError } from "@/modules/authentication/infrastructure/errors/auth-api.error";

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

let mockLoginState: {
  login: ReturnType<typeof vi.fn>;
  isLoading: boolean;
  error: unknown;
} = { login: vi.fn(), isLoading: false, error: null };

vi.mock("@/modules/authentication/presentation/hooks/use-login", () => ({
  useLogin: () => mockLoginState,
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginState = { login: vi.fn(), isLoading: false, error: null };
  });

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

  // --- Branch: error display ---
  it("Given: AuthApiError with known code When: rendering Then: should show error div with that key", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: false,
      error: new AuthApiError("Unauthorized", "unauthorized", 401),
    };

    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe("unauthorized");
  });

  it("Given: AuthApiError with unknown code When: rendering Then: should fall back to generic", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: false,
      error: new AuthApiError("Bad", "unknownCode", 400),
    };

    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe("generic");
  });

  it("Given: non-AuthApiError When: rendering Then: should show generic error", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: false,
      error: new Error("Some random error"),
    };

    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv).not.toBeNull();
    expect(errorDiv?.textContent).toBe("generic");
  });

  // --- Branch: isLoading ---
  it("Given: isLoading true When: rendering Then: should show submitting text and disable button", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: true,
      error: null,
    };

    render(<LoginForm />);
    expect(screen.getByText("submitting")).toBeDefined();
    expect(screen.queryByText("submit")).toBeNull();
    const button = screen.getByText("submitting").closest("button");
    expect(button).toBeDisabled();
  });

  // --- Branch: AuthApiError with forbidden code ---
  it("Given: AuthApiError with forbidden code When: rendering Then: should show forbidden error", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: false,
      error: new AuthApiError("Forbidden", "forbidden", 403),
    };

    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv?.textContent).toBe("forbidden");
  });

  // --- Branch: AuthApiError with serverError code ---
  it("Given: AuthApiError with serverError code When: rendering Then: should show serverError", () => {
    mockLoginState = {
      login: vi.fn(),
      isLoading: false,
      error: new AuthApiError("Internal", "serverError", 500),
    };

    render(<LoginForm />);
    const errorDiv = document.querySelector(".bg-destructive\\/10");
    expect(errorDiv?.textContent).toBe("serverError");
  });
});
