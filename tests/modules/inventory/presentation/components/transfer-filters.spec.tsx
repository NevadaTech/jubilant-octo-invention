import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransferFiltersComponent } from "@/modules/inventory/presentation/components/transfers/transfer-filters";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/shared/presentation/hooks", () => ({
  useDebounce: (value: string) => value,
}));

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useWarehouses: () => ({ data: { data: [{ id: "wh-1", name: "Main" }] } }),
}));

describe("TransferFiltersComponent", () => {
  const defaultFilters = { page: 1, limit: 10 };
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: default filters When: rendering Then: should render search input", () => {
    render(
      <TransferFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByPlaceholderText("search.placeholder")).toBeDefined();
  });

  it("Given: default filters When: rendering Then: should render filter button", () => {
    render(
      <TransferFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("filter")).toBeDefined();
  });

  it("Given: filters with status When: rendering Then: should show clear button", () => {
    render(
      <TransferFiltersComponent
        filters={{ ...defaultFilters, status: ["DRAFT"] }}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.getByText("clearFilters")).toBeDefined();
  });

  it("Given: no active filters When: rendering Then: should not show clear button", () => {
    render(
      <TransferFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    expect(screen.queryByText("clearFilters")).toBeNull();
  });

  it("Given: rendered component When: clicking filter button Then: should show status, fromWarehouse, toWarehouse and date filters", () => {
    render(
      <TransferFiltersComponent
        filters={defaultFilters}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("filter"));
    expect(screen.getByText("filters.status")).toBeDefined();
    expect(screen.getByText("filters.fromWarehouse")).toBeDefined();
    expect(screen.getByText("filters.toWarehouse")).toBeDefined();
    expect(screen.getByText("filters.dateRange")).toBeDefined();
  });

  it("Given: active filters When: clicking clear Then: should reset all filters", () => {
    render(
      <TransferFiltersComponent
        filters={{ ...defaultFilters, status: ["DRAFT"], search: "x" }}
        onFiltersChange={mockOnChange}
      />,
    );
    fireEvent.click(screen.getByText("clearFilters"));
    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        status: undefined,
        fromWarehouseIds: undefined,
        toWarehouseIds: undefined,
        startDate: undefined,
        endDate: undefined,
        search: undefined,
      }),
    );
  });
});
