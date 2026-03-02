import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoleTypeBadge } from "@/modules/roles/presentation/components/role-type-badge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("RoleTypeBadge", () => {
  it("Given: isSystem true When: rendering Then: should display system label with info variant", () => {
    // Arrange & Act
    render(<RoleTypeBadge isSystem={true} />);

    // Assert
    expect(screen.getByText("system")).toBeDefined();
    const badge = screen.getByText("system").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: isSystem false When: rendering Then: should display custom label with secondary variant", () => {
    // Arrange & Act
    render(<RoleTypeBadge isSystem={false} />);

    // Assert
    expect(screen.getByText("custom")).toBeDefined();
    const badge = screen.getByText("custom").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });
});
