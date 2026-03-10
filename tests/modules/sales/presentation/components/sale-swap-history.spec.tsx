import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

let mockSwapData: unknown[] | undefined = undefined;
let mockIsLoading = false;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useSaleSwapHistory: () => ({
    data: mockSwapData,
    isLoading: mockIsLoading,
  }),
}));

import { SaleSwapHistory } from "@/modules/sales/presentation/components/sale-swap-history";

describe("SaleSwapHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSwapData = undefined;
    mockIsLoading = false;
  });

  // ── Loading state ───────────────────────────────────────────────────

  it("Given: data is loading When: rendering Then: should show skeleton placeholders", () => {
    mockIsLoading = true;
    const { container } = render(<SaleSwapHistory saleId="sale-1" />);
    const skeletons = container.querySelectorAll(".animate-pulse");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("Given: data is loading When: rendering Then: should not show title", () => {
    mockIsLoading = true;
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.queryByText("title")).toBeNull();
  });

  // ── Empty state ─────────────────────────────────────────────────────

  it("Given: no swaps When: rendering Then: should render nothing", () => {
    mockSwapData = [];
    const { container } = render(<SaleSwapHistory saleId="sale-1" />);
    expect(container.innerHTML).toBe("");
  });

  it("Given: swaps is undefined When: rendering Then: should render nothing", () => {
    mockSwapData = undefined;
    const { container } = render(<SaleSwapHistory saleId="sale-1" />);
    expect(container.innerHTML).toBe("");
  });

  // ── Data state ──────────────────────────────────────────────────────

  it("Given: swap history data When: rendering Then: should show title with icon", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText("title")).toBeDefined();
  });

  it("Given: swap history data When: rendering Then: should show original product name", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText("Widget A")).toBeDefined();
    expect(screen.getByText("Widget B")).toBeDefined();
  });

  it("Given: swap history data When: rendering Then: should show product SKUs", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText("(WA-001)")).toBeDefined();
    expect(screen.getByText("(WB-001)")).toBeDefined();
  });

  it("Given: swap with cross-warehouse flag When: rendering Then: should show cross-warehouse badge", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: true,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText("crossWarehouse")).toBeDefined();
  });

  it("Given: swap with different quantities When: rendering Then: should show partial badge", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 5,
        replacementQuantity: 3,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "NEW_PRICE",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText("partial")).toBeDefined();
  });

  it("Given: swap without reason When: rendering Then: should not show reason line", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.queryByText(/reason:/)).toBeNull();
  });

  it("Given: swap with reason When: rendering Then: should show reason text", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: "Customer requested",
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText(/Customer requested/)).toBeDefined();
  });

  it("Given: swap history data When: rendering Then: should show performer name", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.getByText(/Admin User/)).toBeDefined();
  });

  it("Given: swap with equal quantities When: rendering Then: should not show partial badge", () => {
    mockSwapData = [
      {
        id: "swap-1",
        originalProductName: "Widget A",
        originalProductSku: "WA-001",
        replacementProductName: "Widget B",
        replacementProductSku: "WB-001",
        originalQuantity: 2,
        replacementQuantity: 2,
        originalSalePrice: 100,
        replacementSalePrice: 120,
        originalCurrency: "COP",
        replacementCurrency: "COP",
        pricingStrategy: "KEEP_ORIGINAL",
        isCrossWarehouse: false,
        reason: null,
        performedByName: "Admin User",
        createdAt: "2025-06-01T12:00:00Z",
      },
    ];
    render(<SaleSwapHistory saleId="sale-1" />);
    expect(screen.queryByText("partial")).toBeNull();
  });
});
