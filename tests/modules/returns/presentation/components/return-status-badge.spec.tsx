import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnStatusBadge } from "@/modules/returns/presentation/components/return-status-badge";
import type { ReturnStatus } from "@/modules/returns/domain/entities/return.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ReturnStatusBadge", () => {
  it("Given: DRAFT status When: rendering Then: should display draft label with secondary variant", () => {
    // Arrange
    const status: ReturnStatus = "DRAFT";

    // Act
    render(<ReturnStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("draft")).toBeDefined();
    const badge = screen.getByText("draft").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: CONFIRMED status When: rendering Then: should display confirmed label with success variant", () => {
    // Arrange
    const status: ReturnStatus = "CONFIRMED";

    // Act
    render(<ReturnStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("confirmed")).toBeDefined();
    const badge = screen.getByText("confirmed").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: CANCELLED status When: rendering Then: should display cancelled label with error variant", () => {
    // Arrange
    const status: ReturnStatus = "CANCELLED";

    // Act
    render(<ReturnStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("cancelled")).toBeDefined();
    const badge = screen.getByText("cancelled").closest("div");
    expect(badge?.className).toContain("bg-error");
  });
});
