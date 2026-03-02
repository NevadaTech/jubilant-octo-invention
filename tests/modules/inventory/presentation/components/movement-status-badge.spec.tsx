import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovementStatusBadge } from "@/modules/inventory/presentation/components/movements/movement-status-badge";
import type { MovementStatus } from "@/modules/inventory/domain/entities/stock-movement.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("MovementStatusBadge", () => {
  it("Given: DRAFT status When: rendering Then: should display draft label with secondary variant", () => {
    // Arrange
    const status: MovementStatus = "DRAFT";

    // Act
    render(<MovementStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("draft")).toBeDefined();
    const badge = screen.getByText("draft").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: POSTED status When: rendering Then: should display posted label with success variant", () => {
    // Arrange
    const status: MovementStatus = "POSTED";

    // Act
    render(<MovementStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("posted")).toBeDefined();
    const badge = screen.getByText("posted").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: VOID status When: rendering Then: should display void label with error variant", () => {
    // Arrange
    const status: MovementStatus = "VOID";

    // Act
    render(<MovementStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("void")).toBeDefined();
    const badge = screen.getByText("void").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("Given: RETURNED status When: rendering Then: should display returned label with warning variant", () => {
    // Arrange
    const status: MovementStatus = "RETURNED";

    // Act
    render(<MovementStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("returned")).toBeDefined();
    const badge = screen.getByText("returned").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });
});
