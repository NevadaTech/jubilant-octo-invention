import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaleStatusBadge } from "@/modules/sales/presentation/components/sale-status-badge";
import type { SaleStatus } from "@/modules/sales/domain/entities/sale.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("SaleStatusBadge", () => {
  it("Given: DRAFT status When: rendering Then: should display draft label with secondary variant", () => {
    // Arrange
    const status: SaleStatus = "DRAFT";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("draft")).toBeDefined();
    const badge = screen.getByText("draft").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: CONFIRMED status When: rendering Then: should display confirmed label with success variant", () => {
    // Arrange
    const status: SaleStatus = "CONFIRMED";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("confirmed")).toBeDefined();
    const badge = screen.getByText("confirmed").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: PICKING status When: rendering Then: should display picking label with warning variant", () => {
    // Arrange
    const status: SaleStatus = "PICKING";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("picking")).toBeDefined();
    const badge = screen.getByText("picking").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });

  it("Given: SHIPPED status When: rendering Then: should display shipped label with info variant", () => {
    // Arrange
    const status: SaleStatus = "SHIPPED";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("shipped")).toBeDefined();
    const badge = screen.getByText("shipped").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: COMPLETED status When: rendering Then: should display completed label with success variant", () => {
    // Arrange
    const status: SaleStatus = "COMPLETED";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("completed")).toBeDefined();
    const badge = screen.getByText("completed").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: CANCELLED status When: rendering Then: should display cancelled label with error variant", () => {
    // Arrange
    const status: SaleStatus = "CANCELLED";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("cancelled")).toBeDefined();
    const badge = screen.getByText("cancelled").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("Given: RETURNED status When: rendering Then: should display returned label with warning variant", () => {
    // Arrange
    const status: SaleStatus = "RETURNED";

    // Act
    render(<SaleStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("returned")).toBeDefined();
    const badge = screen.getByText("returned").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });
});
