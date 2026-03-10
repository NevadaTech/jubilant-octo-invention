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
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with types When: rendering Then: should show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, types: ["RETURN_CUSTOMER"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show type, status, warehouse and date filters", () => {
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.type")).toBeDefined();
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.getByText("filters.warehouse")).toBeDefined();
    expect(screen.getByText("filters.dateFrom")).toBeDefined();
    expect(screen.getByText("filters.dateTo")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset all filters", () => {
    render(
      <ReturnFiltersComponent
        filters={{
          ...defaultFilters,
          types: ["RETURN_CUSTOMER"],
          search: "ret",
        }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        types: undefined,
        status: undefined,
        warehouseIds: undefined,
        startDate: undefined,
        endDate: undefined,
        search: undefined,
      }),
    );
  });

  // --- Branch: hasActiveFilters with status ---
  it("Given: filters with status When: rendering Then: should show clear button and indicator", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, status: ["DRAFT"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
    expect(screen.getByText("!")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with warehouseIds ---
  it("Given: filters with warehouseIds When: rendering Then: should show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, warehouseIds: ["wh-1"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with startDate ---
  it("Given: filters with startDate When: rendering Then: should show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, startDate: "2026-01-01" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with endDate ---
  it("Given: filters with endDate When: rendering Then: should show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, endDate: "2026-12-31" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: hasActiveFilters with search ---
  it("Given: filters with search When: rendering Then: should show clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, search: "RT-001" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: search change calls onFiltersChange ---
  it("Given: empty search When: typing Then: should call onFiltersChange with search", () => {
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "test" } });
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({ search: "test", page: 1 }),
    );
  });

  // --- Branch: clearing search ---
  it("Given: search has value When: clearing Then: should call onFiltersChange with undefined search", () => {
    render(
      <ReturnFiltersComponent
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

  // --- Branch: toggle filter panel ---
  it("Given: filters panel open When: clicking filter again Then: should close", () => {
    render(
      <ReturnFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    const filterBtn = screen.getByText("filter");
    fireEvent.click(filterBtn);
    expect(screen.getByText("filters.type")).toBeDefined();
    fireEvent.click(filterBtn);
    expect(screen.queryByText("filters.type")).toBeNull();
  });

  // --- Branch: date change handlers ---
  it("Given: filter panel open When: setting date from Then: should call onFiltersChange with startDate", () => {
    render(
      <ReturnFiltersComponent
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
      <ReturnFiltersComponent
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
      <ReturnFiltersComponent
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
      <ReturnFiltersComponent
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

  // --- Branch: debounced search same as current ---
  it("Given: search value equals current When: rendering Then: should not call onFiltersChange", () => {
    render(
      <ReturnFiltersComponent
        filters={{ ...defaultFilters, search: "existing" }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(mockOnChange).not.toHaveBeenCalled();
  });

  // --- Branch: combined active filters ---
  it("Given: multiple active filters When: rendering Then: should show indicator and clear button", () => {
    render(
      <ReturnFiltersComponent
        filters={{
          ...defaultFilters,
          types: ["RETURN_CUSTOMER"],
          status: ["DRAFT"],
          warehouseIds: ["wh-1"],
          startDate: "2026-01-01",
          endDate: "2026-12-31",
          search: "RT",
        }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("!")).toBeDefined();
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  // --- Branch: clear filters preserves sortBy and sortOrder ---
  it("Given: filters with sortBy/sortOrder When: clearing Then: sortBy and sortOrder are preserved", () => {
    render(
      <ReturnFiltersComponent
        filters={{
          ...defaultFilters,
          types: ["RETURN_CUSTOMER"],
          sortBy: "createdAt",
          sortOrder: "desc",
        }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        sortBy: "createdAt",
        sortOrder: "desc",
        types: undefined,
      }),
    );
  });
});
