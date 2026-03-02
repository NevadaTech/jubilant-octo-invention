import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccessDenied } from "@/shared/presentation/components/access-denied";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AccessDenied", () => {
  it("Given: component rendered When: no permissions Then: should display access denied title", () => {
    // Arrange & Act
    render(<AccessDenied />);

    // Assert
    expect(screen.getByText("accessDenied")).toBeDefined();
  });

  it("Given: component rendered When: no permissions Then: should display access denied description", () => {
    // Arrange & Act
    render(<AccessDenied />);

    // Assert
    expect(screen.getByText("accessDeniedDescription")).toBeDefined();
  });

  it("Given: component rendered When: no permissions Then: should display back to dashboard link", () => {
    // Arrange & Act
    render(<AccessDenied />);

    // Assert
    const link = screen.getByText("backToDashboard");
    expect(link).toBeDefined();
    const anchor = link.closest("a");
    expect(anchor?.getAttribute("href")).toBe("/dashboard");
  });
});
