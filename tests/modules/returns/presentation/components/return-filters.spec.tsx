import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReturnFiltersComponent } from "@/modules/returns/presentation/components/return-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useWarehouses: () => ({ data: { data: [{ id: "wh-1", name: "Main" }] } }),
}));

describe("ReturnFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(<ReturnFiltersComponent filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(<ReturnFiltersComponent filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with types When: rendering Then: should show clear button", () => {
    render(<ReturnFiltersComponent filters={{ ...defaultFilters, types: ["RETURN_CUSTOMER"] }} onFiltersChange={mockOnChange} />);
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(<ReturnFiltersComponent filters={defaultFilters} onFiltersChange={mockOnChange} />);
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show type, status, warehouse and date filters", () => {
    render(<ReturnFiltersComponent filters={defaultFilters} onFiltersChange={mockOnChange} />);
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.type")).toBeDefined();
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.getByText("filters.warehouse")).toBeDefined();
    expect(screen.getByText("filters.dateFrom")).toBeDefined();
    expect(screen.getByText("filters.dateTo")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset all filters", () => {
    render(<ReturnFiltersComponent filters={{ ...defaultFilters, types: ["RETURN_CUSTOMER"], search: "ret" }} onFiltersChange={mockOnChange} />);
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith(expect.objectContaining({
      page: 1,
      types: undefined,
      status: undefined,
      warehouseIds: undefined,
      startDate: undefined,
      endDate: undefined,
      search: undefined,
    }));
  });
});
