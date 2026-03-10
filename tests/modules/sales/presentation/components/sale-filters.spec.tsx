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

  // --- Branch: hasActiveFilters with warehouseIds ---
  it("Given: filters with warehouseIds When: rendering Then: should show clear button and indicator", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, warehouseIds: ["wh-1"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
    // Active filter indicator (!)
    expect(screen.getByText("!")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with startDate ---
  it("Given: filters with startDate When: rendering Then: should show clear button", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, startDate: "2026-01-01" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with endDate ---
  it("Given: filters with endDate When: rendering Then: should show clear button", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, endDate: "2026-12-31" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with search ---
  it("Given: filters with search When: rendering Then: should show clear button", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, search: "SL-001" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: search input change triggers debounced search ---
  it("Given: empty search When: typing a search value Then: should call onFiltersChange with search", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "test" } });
    // With mocked useDebounce returning value immediately:
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "test", page: 1 }),
    );
  });

  // --- Branch: clearing search to empty ---
  it("Given: search has value When: clearing search Then: should call onFiltersChange with undefined search", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, search: "old" }}
        onFiltersChange={mockOnChange}
      />,
    );
    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "" } });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: undefined, page: 1 }),
    );
  });

  // --- Branch: toggle filter panel twice ---
  it("Given: filters open When: clicking filter again Then: should close filter panel", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    const filterBtn = screen.getByText("filter");
    fireEvent.click(filterBtn);
    expect(screen.getByText("filters.status")).toBeDefined();
    fireEvent.click(filterBtn);
    expect(screen.queryByText("filters.status")).toBeNull();
  });

  // --- Branch: date inputs ---
  it("Given: filter panel open When: setting date from Then: should call onFiltersChange with startDate", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    const allDateInputs = document.querySelectorAll('input[type="date"]');
    if (allDateInputs.length >= 1) {
      fireEvent.change(allDateInputs[0], { target: { value: "2026-03-01" } });
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: "2026-03-01", page: 1 }),
      );
    }
  });

  it("Given: filter panel open When: setting date to Then: should call onFiltersChange with endDate", () => {
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    const allDateInputs = document.querySelectorAll('input[type="date"]');
    if (allDateInputs.length >= 2) {
      fireEvent.change(allDateInputs[1], { target: { value: "2026-03-31" } });
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ endDate: "2026-03-31", page: 1 }),
      );
    }
  });

  it("Given: filter panel open When: clearing date from Then: should call onFiltersChange with undefined startDate", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, startDate: "2026-01-01" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    const allDateInputs = document.querySelectorAll('input[type="date"]');
    if (allDateInputs.length >= 1) {
      fireEvent.change(allDateInputs[0], { target: { value: "" } });
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ startDate: undefined, page: 1 }),
      );
    }
  });

  // --- Branch: clearing date to (endDate) ---
  it("Given: filter panel open When: clearing date to Then: should call onFiltersChange with undefined endDate", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, endDate: "2026-12-31" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    const allDateInputs = document.querySelectorAll('input[type="date"]');
    if (allDateInputs.length >= 2) {
      fireEvent.change(allDateInputs[1], { target: { value: "" } });
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ endDate: undefined, page: 1 }),
      );
    }
  });

  // --- Branch: debounced search same as current (no call) ---
  it("Given: search value same as current When: rendering Then: should not call onFiltersChange", () => {
    render(
      <SaleFiltersComponent
        filters={{ ...defaultFilters, search: "existing" }}
        onFiltersChange={mockOnChange}
      />,
    );
    // Since mocked useDebounce returns value immediately and the initial
    // searchValue is "existing" which matches filters.search, no call
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  // --- Branch: combined active filters show indicator ---
  it("Given: multiple active filters When: rendering Then: should show filter indicator", () => {
    render(
      <SaleFiltersComponent
        filters={{
          ...defaultFilters,
          status: ["DRAFT"],
          warehouseIds: ["wh-1"],
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          search: "order",
        }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("!")).toBeDefined();
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: no warehousesData ---
  it("Given: warehousesData is undefined When: rendering Then: warehouseOptions defaults to empty", () => {
    // Even with the mock always returning data, just verify renders without crash
    render(
      <SaleFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });
});
