import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserStatusBadge } from "@/modules/users/presentation/components/user-status-badge";
import type { UserStatus } from "@/modules/users/domain/entities/user.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("UserStatusBadge", () => {
  it("Given: ACTIVE status When: rendering Then: should display active label with success variant", () => {
    // Arrange
    const status: UserStatus = "ACTIVE";

    // Act
    render(<UserStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("active")).toBeDefined();
    const badge = screen.getByText("active").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: INACTIVE status When: rendering Then: should display inactive label with secondary variant", () => {
    // Arrange
    const status: UserStatus = "INACTIVE";

    // Act
    render(<UserStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("inactive")).toBeDefined();
    const badge = screen.getByText("inactive").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: LOCKED status When: rendering Then: should display locked label with error variant", () => {
    // Arrange
    const status: UserStatus = "LOCKED";

    // Act
    render(<UserStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("locked")).toBeDefined();
    const badge = screen.getByText("locked").closest("div");
    expect(badge?.className).toContain("bg-error");
  });
});
