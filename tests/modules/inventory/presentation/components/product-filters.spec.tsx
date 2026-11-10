import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductFilters } from "@/modules/inventory/presentation/components/products/product-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useCategories: () => ({
    data: { data: [{ id: "cat-1", name: "Electronics" }] },
  }),
}));

vi.mock("@/modules/brands/presentation/hooks/use-brands", () => ({
  useBrands: () => ({
    data: { data: [{ id: "brand-1", name: "Acme" }] },
  }),
}));

describe("ProductFilters", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should show search and filters without a click", () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.byNameOrSku")).toBeDefined();
    expect(screen.getByText("filters.category")).toBeDefined();
    expect(screen.getByText("filters.brand")).toBeDefined();
    expect(screen.getByText("fields.status")).toBeDefined();
    expect(screen.queryByText("filter")).toBeNull();
  });

  it("Given: empty search When: user types Then: should call onFiltersChange with search and page 1", () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("search.byNameOrSku"), {
      target: { value: "widget" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: "widget",
    });
  });

  it("Given: active search When: user clears the field Then: should reset search and keep other filters", () => {
    render(
      <ProductFilters
        filters={{ ...defaultFilters, search: "widget", statuses: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("search.byNameOrSku"), {
      target: { value: "" },
    });
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      search: undefined,
      statuses: ["ACTIVE"],
    });
  });

  it("Given: visible category filter When: selecting Electronics Then: should call onFiltersChange with categoryIds", () => {
    render(
      <ProductFilters
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filters.allCategories"));
    fireEvent.click(screen.getByRole("option", { name: "Electronics" }));
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      categoryIds: ["cat-1"],
    });
  });

  it("Given: selected category When: clearing the selection Then: should reset categoryIds", () => {
    render(
      <ProductFilters
        filters={{ ...defaultFilters, categoryIds: ["cat-1"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(mockOnChange).toHaveBeenCalledWith({
      page: 1,
      limit: 10,
      categoryIds: undefined,
    });
  });
});
