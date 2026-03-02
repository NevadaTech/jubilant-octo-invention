import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnTypeBadge } from "@/modules/returns/presentation/components/return-type-badge";
import type { ReturnType } from "@/modules/returns/domain/entities/return.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ReturnTypeBadge", () => {
  it("Given: RETURN_CUSTOMER type When: rendering Then: should display customer label with info variant", () => {
    // Arrange
    const type: ReturnType = "RETURN_CUSTOMER";

    // Act
    render(<ReturnTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("customer")).toBeDefined();
    const badge = screen.getByText("customer").closest("div");
    expect(badge?.className).toContain("bg-info");
  });

  it("Given: RETURN_SUPPLIER type When: rendering Then: should display supplier label with warning variant", () => {
    // Arrange
    const type: ReturnType = "RETURN_SUPPLIER";

    // Act
    render(<ReturnTypeBadge type={type} />);

    // Assert
    expect(screen.getByText("supplier")).toBeDefined();
    const badge = screen.getByText("supplier").closest("div");
    expect(badge?.className).toContain("bg-warning");
  });
});
