import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SaleFiltersComponent } from "@/modules/sales/presentation/components/sale-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useWarehouses: () => ({ data: { data: [{ id: "wh-1", name: "Main" }] } }),
}));

describe("SaleFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with status When: rendering Then: should show clear button", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, status: ["DRAFT"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show status, warehouse and date filters", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.getByText("filters.warehouse")).toBeDefined();
    expect(screen.getByText("filters.dateFrom")).toBeDefined();
    expect(screen.getByText("filters.dateTo")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset filters", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, status: ["CONFIRMED"], search: "order" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith({ page: 1, limit: 10 });
  });
});
