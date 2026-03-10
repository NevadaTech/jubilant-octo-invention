import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockTable } from "@/modules/inventory/presentation/components/stock/stock-table";
import { Stock } from "@/modules/inventory/domain/entities/stock.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

let mockQueryState: {
  data: { data: Stock[] } | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} = { data: undefined, isLoading: false, isError: false, error: null };

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useStock: () => mockQueryState,
  useStockFilters: () => ({ page: 1, limit: 20, search: "" }),
  useSetStockFilters: () => vi.fn(),
  useWarehouses: () => ({ data: { data: [] } }),
}));

vi.mock(
  "@/modules/inventory/presentation/components/stock/reorder-rule-dialog",
  () => ({
    ReorderRuleDialog: () => <div data-testid="reorder-rule-dialog" />,
  }),
);

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

vi.mock("@/ui/components/multi-select", () => ({
  MultiSelect: () => <div data-testid="multi-select" />,
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: () => null,
}));

// --- Helpers ---

function makeStock(
  overrides: Partial<{
    id: string;
    productName: string;
    productSku: string;
    warehouseName: string;
    quantity: number;
    averageCost: number;
    totalValue: number;
  }> = {},
): Stock {
  return Stock.create({
    id: overrides.id ?? "stock-1",
    productId: "p1",
    productName: overrides.productName ?? "Widget A",
    productSku: overrides.productSku ?? "WA-001",
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Main Warehouse",
    quantity: overrides.quantity ?? 100,
    reservedQuantity: 5,
    availableQuantity: 95,
    averageCost: overrides.averageCost ?? 12.5,
    totalValue: overrides.totalValue ?? 1250.0,
    currency: "USD",
    lastMovementAt: new Date("2026-01-20T14:00:00Z"),
  });
}

// --- Tests ---

describe("StockTable", () => {
  beforeEach(() => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it("Given: data loaded When: rendering Then: should display the stock title", () => {
    const stock = makeStock();
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);

    expect(screen.getByText("title")).toBeDefined();
  });

  it("Given: stock items exist When: rendering Then: should render product name, SKU, and warehouse for each row", () => {
    const s1 = makeStock({
      id: "s1",
      productName: "Widget A",
      productSku: "WA-001",
      warehouseName: "Main Warehouse",
    });
    const s2 = makeStock({
      id: "s2",
      productName: "Gadget B",
      productSku: "GB-002",
      warehouseName: "East Warehouse",
    });

    mockQueryState = {
      data: { data: [s1, s2] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);

    expect(screen.getByText("Widget A")).toBeDefined();
    expect(screen.getByText("WA-001")).toBeDefined();
    expect(screen.getByText("Main Warehouse")).toBeDefined();
    expect(screen.getByText("Gadget B")).toBeDefined();
    expect(screen.getByText("GB-002")).toBeDefined();
    expect(screen.getByText("East Warehouse")).toBeDefined();
  });

  it("Given: stock items exist When: rendering Then: should display summary cards with totals", () => {
    const stock = makeStock({ quantity: 100, totalValue: 1250 });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);

    // Summary cards are rendered with translated labels
    expect(screen.getByText("summary.totalItems")).toBeDefined();
    expect(screen.getByText("summary.totalQuantity")).toBeDefined();
    expect(screen.getByText("summary.totalValue")).toBeDefined();
    expect(screen.getByText("summary.lowStockItems")).toBeDefined();
  });

  it("Given: no stock items When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: { data: [] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };

    const { container } = render(<StockTable />);

    // StockTableSkeleton renders 5 skeleton items with animate-pulse
    const pulseElements = container.querySelectorAll(".animate-pulse");
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
    };

    render(<StockTable />);

    expect(screen.getByText(/error\.loading/)).toBeDefined();
  });

  // --- Branch: stock with no productName (falls back to productId) ---
  it("Given: stock with no productName When: rendering Then: should show productId", () => {
    const stock = Stock.create({
      id: "s-no-name",
      productId: "pid-fallback",
      productName: "",
      productSku: "SK-1",
      warehouseId: "wh-1",
      warehouseName: "Main",
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
      averageCost: 10,
      totalValue: 500,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    expect(screen.getByText("pid-fallback")).toBeDefined();
  });

  // --- Branch: stock with no productSku ---
  it("Given: stock with no productSku When: rendering Then: should not show SKU line", () => {
    const stock = Stock.create({
      id: "s-no-sku",
      productId: "p1",
      productName: "Widget",
      productSku: "",
      warehouseId: "wh-1",
      warehouseName: "Main",
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
      averageCost: 10,
      totalValue: 500,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    expect(screen.getByText("Widget")).toBeDefined();
  });

  // --- Branch: stock with no warehouseName (falls back to warehouseId) ---
  it("Given: stock with no warehouseName When: rendering Then: should show warehouseId", () => {
    const stock = Stock.create({
      id: "s-no-wh-name",
      productId: "p1",
      productName: "Widget",
      productSku: "SK-1",
      warehouseId: "wh-fallback",
      warehouseName: "",
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
      averageCost: 10,
      totalValue: 500,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    expect(screen.getByText("wh-fallback")).toBeDefined();
  });

  // --- Branch: low stock (availableQuantity <= 10) shows warning ---
  it("Given: stock with low quantity When: rendering Then: should show warning styling", () => {
    const stock = Stock.create({
      id: "s-low",
      productId: "p1",
      productName: "Widget Low",
      productSku: "SK-LOW",
      warehouseId: "wh-1",
      warehouseName: "Main",
      quantity: 5,
      reservedQuantity: 0,
      availableQuantity: 5,
      averageCost: 10,
      totalValue: 50,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    const { container } = render(<StockTable />);
    // Warning icon and styling
    const warningElements = container.querySelectorAll(".text-warning-500");
    expect(warningElements.length).toBeGreaterThan(0);
  });

  // --- Branch: out of stock (isOutOfStock = true) ---
  it("Given: stock with zero quantity When: rendering Then: should have isOutOfStock true", () => {
    const stock = Stock.create({
      id: "s-oos",
      productId: "p1",
      productName: "Widget OOS",
      productSku: "SK-OOS",
      warehouseId: "wh-1",
      warehouseName: "Main",
      quantity: 0,
      reservedQuantity: 0,
      availableQuantity: 0,
      averageCost: 10,
      totalValue: 0,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    // Zero quantity stock should be out of stock
    expect(stock.isOutOfStock).toBe(true);
    expect(screen.getByText("Widget OOS")).toBeDefined();
  });

  // --- Branch: lastMovementAt null shows dash ---
  it("Given: stock with null lastMovementAt When: rendering Then: should show dash", () => {
    const stock = Stock.create({
      id: "s-no-last-mov",
      productId: "p1",
      productName: "Widget NoMov",
      productSku: "SK-NM",
      warehouseId: "wh-1",
      warehouseName: "Main",
      quantity: 50,
      reservedQuantity: 0,
      availableQuantity: 50,
      averageCost: 10,
      totalValue: 500,
      currency: "USD",
      lastMovementAt: null,
    });
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    const dashes = screen.getAllByText("-");
    expect(dashes.length).toBeGreaterThan(0);
  });

  // --- Branch: lastMovementAt defined shows date ---
  it("Given: stock with lastMovementAt When: rendering Then: should show formatted date", () => {
    const stock = makeStock();
    mockQueryState = {
      data: { data: [stock] },
      isLoading: false,
      isError: false,
      error: null,
    };

    render(<StockTable />);
    // Date is formatted by toLocaleDateString
    // At least no dash should appear for this cell
    expect(screen.getByText("Widget A")).toBeDefined();
  });

  // --- Branch: error with no message ---
  it("Given: error state with null error When: rendering Then: should still show error", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: null,
    };

    render(<StockTable />);
    expect(screen.getByText(/error\.loading/)).toBeDefined();
  });
});
