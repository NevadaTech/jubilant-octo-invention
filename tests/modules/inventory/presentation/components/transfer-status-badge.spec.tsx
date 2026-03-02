import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransferStatusBadge } from "@/modules/inventory/presentation/components/transfers/transfer-status-badge";
import type { TransferStatus } from "@/modules/inventory/domain/entities/transfer.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("TransferStatusBadge", () => {
  it("Given: DRAFT status When: rendering Then: should display draft label with secondary variant", () => {
    // Arrange
    const status: TransferStatus = "DRAFT";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("draft")).toBeDefined();
    const badge = screen.getByText("draft").closest("div");
    expect(badge?.className).toContain("bg-secondary");
  });

  it("Given: IN_TRANSIT status When: rendering Then: should display in_transit label with info variant", () => {
    // Arrange
    const status: TransferStatus = "IN_TRANSIT";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("in_transit")).toBeDefined();
    const badge = screen.getByText("in_transit").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: PARTIAL status When: rendering Then: should display partial label with warning variant", () => {
    // Arrange
    const status: TransferStatus = "PARTIAL";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("partial")).toBeDefined();
    const badge = screen.getByText("partial").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });

  it("Given: RECEIVED status When: rendering Then: should display received label with success variant", () => {
    // Arrange
    const status: TransferStatus = "RECEIVED";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("received")).toBeDefined();
    const badge = screen.getByText("received").closest("div");
    expect(badge?.className).toContain("bg-success");
  });

  it("Given: REJECTED status When: rendering Then: should display rejected label with error variant", () => {
    // Arrange
    const status: TransferStatus = "REJECTED";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("rejected")).toBeDefined();
    const badge = screen.getByText("rejected").closest("div");
    expect(badge?.className).toContain("bg-error");
  });

  it("Given: CANCELED status When: rendering Then: should display canceled label with error variant", () => {
    // Arrange
    const status: TransferStatus = "CANCELED";

    // Act
    render(<TransferStatusBadge status={status} />);

    // Assert
    expect(screen.getByText("canceled")).toBeDefined();
    const badge = screen.getByText("canceled").closest("div");
    expect(badge?.className).toContain("bg-error");
  });
});
