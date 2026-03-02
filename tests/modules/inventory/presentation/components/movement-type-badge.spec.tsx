import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MovementTypeBadge } from "@/modules/inventory/presentation/components/movements/movement-type-badge";
import type { MovementType } from "@/modules/inventory/domain/entities/stock-movement.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("MovementTypeBadge", () => {
  it("Given: IN type When: rendering Then: should display in label with success variant", () => {
    // Arrange
    const type: MovementType = "IN";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("in")).toBeDefined();
    const badge = screen.getByText("in").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: OUT type When: rendering Then: should display out label with error variant", () => {
    // Arrange
    const type: MovementType = "OUT";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("out")).toBeDefined();
    const badge = screen.getByText("out").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("Given: ADJUST_IN type When: rendering Then: should display adjust_in label with success variant", () => {
    // Arrange
    const type: MovementType = "ADJUST_IN";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("adjust_in")).toBeDefined();
    const badge = screen.getByText("adjust_in").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: ADJUST_OUT type When: rendering Then: should display adjust_out label with error variant", () => {
    // Arrange
    const type: MovementType = "ADJUST_OUT";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("adjust_out")).toBeDefined();
    const badge = screen.getByText("adjust_out").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("Given: TRANSFER_IN type When: rendering Then: should display transfer_in label with info variant", () => {
    // Arrange
    const type: MovementType = "TRANSFER_IN";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("transfer_in")).toBeDefined();
    const badge = screen.getByText("transfer_in").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: TRANSFER_OUT type When: rendering Then: should display transfer_out label with warning variant", () => {
    // Arrange
    const type: MovementType = "TRANSFER_OUT";

    // Act
    render(<MovementTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("transfer_out")).toBeDefined();
    const badge = screen.getByText("transfer_out").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });
});
