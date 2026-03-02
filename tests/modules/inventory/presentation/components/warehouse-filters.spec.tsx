import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WarehouseFiltersComponent } from "@/modules/inventory/presentation/components/warehouses/warehouse-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

describe("WarehouseFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(
      <WarehouseFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(
      <WarehouseFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with statuses When: rendering Then: should show clear button", () => {
    render(
      <WarehouseFiltersComponent
        filters={{ ...defaultFilters, statuses: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <WarehouseFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show status filter panel", () => {
    render(
      <WarehouseFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.status")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset", () => {
    render(
      <WarehouseFiltersComponent
        filters={{ ...defaultFilters, search: "main", statuses: ["ACTIVE"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith({
      search: undefined,
      statuses: undefined,
      page: 1,
    });
  });
});
