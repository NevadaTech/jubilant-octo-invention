import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactTypeBadge } from "@/modules/contacts/presentation/components/contact-type-badge";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ContactTypeBadge", () => {
  it("Given: CUSTOMER type When: rendering Then: should display CUSTOMER text", () => {
    render(<ContactTypeBadge type="CUSTOMER" />);

    expect(screen.getByText("types.CUSTOMER")).toBeInTheDocument();
  });

  it("Given: SUPPLIER type When: rendering Then: should display SUPPLIER text", () => {
    render(<ContactTypeBadge type="SUPPLIER" />);

    expect(screen.getByText("types.SUPPLIER")).toBeInTheDocument();
  });

  it("Given: SUPPLIER type When: rendering badge Then: should have correct text", () => {
    const { container } = render(<ContactTypeBadge type="SUPPLIER" />);

    expect(screen.getByText("types.SUPPLIER")).toBeInTheDocument();
    expect(container.firstChild).toBeTruthy();
  });
});
