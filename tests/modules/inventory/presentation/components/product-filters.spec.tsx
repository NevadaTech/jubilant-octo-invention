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
  useCategories: () => ({ data: { data: [{ id: "cat-1", name: "Electronics" }] } }),
}));

describe("ProductFilters", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(<ProductFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(<ProductFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with search When: rendering Then: should show clear button", () => {
    render(<ProductFilters filters={{ ...defaultFilters, search: "widget" }} onFiltersChange={mockOnChange} />);
    expect(screen.getByText("clear")).toBeDefined();
  });

  it("Given: default filters When: no active filters Then: should not show clear button", () => {
    render(<ProductFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.queryByText("clear")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show status and category filters", () => {
    render(<ProductFilters filters={defaultFilters} onFiltersChange={mockOnChange} />);
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.category")).toBeDefined();
  });

  it("Given: active search filter When: clearing Then: should reset filters", () => {
    render(<ProductFilters filters={{ ...defaultFilters, search: "widget", statuses: ["ACTIVE"] }} onFiltersChange={mockOnChange} />);
    fireEvent.click(screen.getByText("clear"));
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({ page: 1, search: undefined, statuses: undefined, categoryIds: undefined }));
  });
});
