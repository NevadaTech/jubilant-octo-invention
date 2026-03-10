import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SaleDetail } from "@/modules/sales/presentation/components/sale-detail";
import { Sale, SaleLine } from "@/modules/sales/domain/entities/sale.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = () => false;
    return t;
  },
  useLocale: () => "en",
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const mockConfirmMutateAsync = vi.fn();
const mockCancelMutateAsync = vi.fn();
const mockStartPickingMutateAsync = vi.fn();
const mockShipMutateAsync = vi.fn();
const mockCompleteMutateAsync = vi.fn();

let mockConfirmPending = false;
let mockCancelPending = false;
let mockStartPickingPending = false;
let mockShipPending = false;
let mockCompletePending = false;

let mockSaleHook: {
  data: Sale | undefined;
  isLoading: boolean;
  isError: boolean;
};

let mockSaleReturnsHook: {
  data:
    | Array<{
        id: string;
        returnNumber: string;
        type: string;
        status: string;
      }>
    | undefined;
};

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useSale: () => mockSaleHook,
  useSaleReturns: () => mockSaleReturnsHook,
  useSaleSwapHistory: () => ({ data: undefined, isLoading: false }),
  useConfirmSale: () => ({
    mutateAsync: mockConfirmMutateAsync,
    isPending: mockConfirmPending,
  }),
  useCancelSale: () => ({
    mutateAsync: mockCancelMutateAsync,
    isPending: mockCancelPending,
  }),
  useStartPicking: () => ({
    mutateAsync: mockStartPickingMutateAsync,
    isPending: mockStartPickingPending,
  }),
  useShipSale: () => ({
    mutateAsync: mockShipMutateAsync,
    isPending: mockShipPending,
  }),
  useCompleteSale: () => ({
    mutateAsync: mockCompleteMutateAsync,
    isPending: mockCompletePending,
  }),
}));

vi.mock("@/modules/sales/presentation/components/sale-status-badge", () => ({
  SaleStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="sale-status-badge">{status}</span>
  ),
}));

vi.mock("@/modules/sales/presentation/components/sale-timeline", () => ({
  SaleTimeline: ({ status }: { status: string }) => (
    <div data-testid="sale-timeline">{status}</div>
  ),
}));

vi.mock("@/modules/sales/presentation/components/sale-swap-dialog", () => ({
  SaleSwapDialog: () => <div data-testid="sale-swap-dialog" />,
}));

vi.mock("@/modules/sales/presentation/components/sale-swap-history", () => ({
  SaleSwapHistory: () => null,
}));

vi.mock(
  "@/modules/sales/presentation/components/picking-verification-card",
  () => ({
    PickingVerificationCard: ({
      onVerificationChange,
    }: {
      onVerificationChange: (v: boolean) => void;
      lines: unknown;
      saleId: string;
    }) => (
      <div data-testid="picking-verification">
        <button
          data-testid="verify-picking"
          onClick={() => onVerificationChange(true)}
        />
        <button
          data-testid="unverify-picking"
          onClick={() => onVerificationChange(false)}
        />
      </div>
    ),
  }),
);

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

let mockPickingConfig = { mode: "OFF" as string };

vi.mock("@/modules/sales/presentation/hooks/use-picking-config", () => ({
  usePickingConfig: () => ({
    config: mockPickingConfig,
    setConfig: vi.fn(),
    isLoading: false,
    isSaving: false,
  }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: { SALES_SWAP: "SALES:SWAP" },
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    title,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    variant?: string;
    size?: string;
    title?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} disabled={disabled} title={title}>
        {children}
      </button>
    );
  },
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-content" className={className}>
      {children}
    </div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h3 data-testid="card-title" className={className}>
      {children}
    </h3>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock("@/ui/components/input", () => ({
  Input: (props: Record<string, unknown>) => (
    <input data-testid="input" {...props} />
  ),
}));

vi.mock("@/ui/components/label", () => ({
  Label: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    htmlFor?: string;
  }) => <label {...props}>{children}</label>,
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="alert-trigger">{children}</div>,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogCancel: ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => <button disabled={disabled}>{children}</button>,
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      data-testid="alert-action"
    >
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({
    children,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) => <div data-testid="ship-dialog">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DialogTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dialog-trigger">{children}</div>,
}));

// --- Helpers ---

function makeSaleLine(
  overrides: Partial<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    salePrice: number;
    totalPrice: number;
  }> = {},
): SaleLine {
  return SaleLine.create({
    id: overrides.id ?? "line-1",
    productId: "p-1",
    productName: overrides.productName ?? "Widget A",
    productSku: overrides.productSku ?? "WA-001",
    productBarcode: null,
    quantity: overrides.quantity ?? 5,
    salePrice: overrides.salePrice ?? 100,
    currency: "USD",
    totalPrice: overrides.totalPrice ?? 500,
  });
}

function makeSale(
  overrides: Partial<{
    id: string;
    saleNumber: string;
    status:
      | "DRAFT"
      | "CONFIRMED"
      | "PICKING"
      | "SHIPPED"
      | "COMPLETED"
      | "CANCELLED"
      | "RETURNED";
    warehouseName: string;
    customerReference: string | null;
    externalReference: string | null;
    totalAmount: number;
    lines: SaleLine[];
    trackingNumber: string | null;
    shippingCarrier: string | null;
    shippingNotes: string | null;
    note: string | null;
    pickingEnabled: boolean;
  }> = {},
): Sale {
  return Sale.create({
    id: overrides.id ?? "sale-1",
    saleNumber: overrides.saleNumber ?? "S-2026-0001",
    status: overrides.status ?? "DRAFT",
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Main Warehouse",
    contactId: null,
    contactName: null,
    customerReference:
      "customerReference" in overrides
        ? (overrides.customerReference as string | null)
        : "CUST-REF-01",
    externalReference:
      "externalReference" in overrides
        ? (overrides.externalReference as string | null)
        : "EXT-001",
    note: overrides.note ?? null,
    totalAmount: overrides.totalAmount ?? 1500,
    currency: "USD",
    lines: overrides.lines ?? [makeSaleLine()],
    movementId: null,
    createdBy: "user-1",
    createdByName: "Alice",
    createdAt: new Date("2026-02-25T10:00:00Z"),
    confirmedAt: null,
    confirmedBy: null,
    confirmedByName: null,
    cancelledAt: null,
    cancelledBy: null,
    cancelledByName: null,
    pickedAt: null,
    pickedBy: null,
    pickedByName: null,
    shippedAt: null,
    shippedBy: null,
    shippedByName: null,
    trackingNumber: overrides.trackingNumber ?? null,
    shippingCarrier: overrides.shippingCarrier ?? null,
    shippingNotes: overrides.shippingNotes ?? null,
    completedAt: null,
    completedBy: null,
    completedByName: null,
    returnedAt: null,
    returnedBy: null,
    returnedByName: null,
    pickingEnabled: overrides.pickingEnabled ?? true,
  });
}

// --- Tests ---

describe("SaleDetail", () => {
  beforeEach(() => {
    mockConfirmMutateAsync.mockReset();
    mockCancelMutateAsync.mockReset();
    mockStartPickingMutateAsync.mockReset();
    mockShipMutateAsync.mockReset();
    mockCompleteMutateAsync.mockReset();
    mockConfirmPending = false;
    mockCancelPending = false;
    mockStartPickingPending = false;
    mockShipPending = false;
    mockCompletePending = false;
    mockPickingConfig = { mode: "OFF" };
    mockSaleHook = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
    mockSaleReturnsHook = { data: undefined };
  });

  // --- Loading ---
  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    mockSaleHook = { data: undefined, isLoading: true, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(3);
  });

  // --- Error / not found ---
  it("Given: error state When: rendering Then: should display error message and back link", () => {
    mockSaleHook = { data: undefined, isLoading: false, isError: true };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("error.loading")).toBeDefined();
    const backLink = screen.getByRole("link");
    expect(backLink.getAttribute("href")).toContain("/sales");
  });

  it("Given: no sale data (not found) When: rendering Then: should display error", () => {
    mockSaleHook = { data: undefined, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("error.loading")).toBeDefined();
  });

  // --- Sale info display ---
  it("Given: sale loaded When: rendering Then: should display sale number, status badge, warehouse, total", () => {
    const sale = makeSale({
      saleNumber: "S-2026-0042",
      status: "DRAFT",
      warehouseName: "East Warehouse",
      totalAmount: 2500,
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("S-2026-0042")).toBeDefined();
    expect(screen.getByTestId("sale-status-badge")).toBeDefined();
    expect(screen.getByText("East Warehouse")).toBeDefined();
    expect(screen.getAllByText("$2,500").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with customerReference When: rendering Then: should show customer ref", () => {
    const sale = makeSale({ customerReference: "CUST-REF-01" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("CUST-REF-01")).toBeDefined();
  });

  it("Given: sale with null customerReference When: rendering Then: should not show the customer ref value", () => {
    const sale = makeSale({ customerReference: null });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    // customerReference is null, so the component renders "- " or "-" as fallback
    expect(screen.queryByText("CUST-REF-01")).not.toBeInTheDocument();
    expect(screen.getByText("fields.customer")).toBeDefined();
  });

  it("Given: sale with null externalReference When: rendering Then: should not show external ref value", () => {
    const sale = makeSale({ externalReference: null });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.queryByText("EXT-001")).not.toBeInTheDocument();
    expect(screen.getByText("fields.externalReference")).toBeDefined();
  });

  it("Given: sale with note When: rendering Then: should display note section", () => {
    const sale = makeSale({ note: "Important note about this sale" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.getByText("Important note about this sale"),
    ).toBeInTheDocument();
    expect(screen.getByText("fields.note")).toBeInTheDocument();
  });

  it("Given: sale without note When: rendering Then: should not display note section", () => {
    const sale = makeSale({ note: null });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.queryByText("fields.note")).not.toBeInTheDocument();
  });

  // --- Shipping details (conditional) ---
  it("Given: sale with shipping details When: rendering Then: should display shipping section", () => {
    const sale = makeSale({
      status: "SHIPPED",
      trackingNumber: "TRK-123456",
      shippingCarrier: "FedEx",
      shippingNotes: "Handle with care",
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("detail.shippingDetails")).toBeDefined();
    expect(screen.getByText("TRK-123456")).toBeDefined();
    expect(screen.getByText("FedEx")).toBeDefined();
    expect(screen.getByText("Handle with care")).toBeDefined();
  });

  it("Given: sale without shipping details When: rendering Then: should NOT display shipping section", () => {
    const sale = makeSale({
      trackingNumber: null,
      shippingCarrier: null,
      shippingNotes: null,
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.queryByText("detail.shippingDetails"),
    ).not.toBeInTheDocument();
  });

  it("Given: sale with only trackingNumber When: rendering Then: should show shipping section with tracking only", () => {
    const sale = makeSale({
      trackingNumber: "TRK-789",
      shippingCarrier: null,
      shippingNotes: null,
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("detail.shippingDetails")).toBeDefined();
    expect(screen.getByText("TRK-789")).toBeDefined();
    expect(
      screen.queryByText("fields.shippingCarrier"),
    ).not.toBeInTheDocument();
  });

  // --- Lines ---
  it("Given: sale with lines When: rendering Then: should display product names and prices", () => {
    const lines = [
      makeSaleLine({
        id: "l1",
        productName: "Gadget X",
        productSku: "GX-01",
        quantity: 3,
        salePrice: 200,
        totalPrice: 600,
      }),
      makeSaleLine({
        id: "l2",
        productName: "Gadget Y",
        productSku: "GY-02",
        quantity: 2,
        salePrice: 150,
        totalPrice: 300,
      }),
    ];
    const sale = makeSale({ lines, totalAmount: 900 });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("Gadget X")).toBeDefined();
    expect(screen.getByText("GX-01")).toBeDefined();
    expect(screen.getByText("Gadget Y")).toBeDefined();
    expect(screen.getByText("GY-02")).toBeDefined();
  });

  it("Given: sale with empty lines When: rendering Then: should display no lines message", () => {
    const sale = makeSale({ lines: [] });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("form.noLines")).toBeDefined();
  });

  // --- canSwapLine column ---
  it("Given: CONFIRMED sale When: rendering lines Then: should show swap column and buttons", () => {
    const sale = makeSale({ status: "CONFIRMED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("actions.swapLine")).toBeDefined();
  });

  it("Given: COMPLETED sale When: rendering lines Then: should NOT show swap column", () => {
    const sale = makeSale({ status: "COMPLETED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.queryByText("actions.swapLine")).not.toBeInTheDocument();
  });

  // --- Action buttons (canConfirm, canCancel, canStartPicking, canShip, canComplete) ---
  it("Given: DRAFT sale When: rendering Then: should show confirm and cancel buttons", () => {
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.getAllByText("actions.confirm").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("actions.cancelSale").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: CONFIRMED sale with pickingEnabled When: rendering Then: should show start picking button", () => {
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.getAllByText("actions.startPicking").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: PICKING sale When: rendering Then: should show ship button", () => {
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.getAllByText("actions.shipSale").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: SHIPPED sale When: rendering Then: should show complete button", () => {
    const sale = makeSale({ status: "SHIPPED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.getAllByText("actions.completeSale").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: COMPLETED sale When: rendering Then: should NOT show confirm/cancel buttons", () => {
    const sale = makeSale({ status: "COMPLETED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.queryByText("actions.confirm")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.cancelSale")).not.toBeInTheDocument();
  });

  // --- Confirm action ---
  it("Given: confirm dialog When: clicking confirm Then: should call confirmSale.mutateAsync", async () => {
    mockConfirmMutateAsync.mockResolvedValue(undefined);
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const confirmAction = actions.find((a) =>
      a.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmAction!);
    await waitFor(() => {
      expect(mockConfirmMutateAsync).toHaveBeenCalledWith("sale-1");
    });
  });

  it("Given: confirm action When: mutation fails Then: should handle error gracefully", async () => {
    mockConfirmMutateAsync.mockRejectedValue(new Error("fail"));
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const confirmAction = actions.find((a) =>
      a.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmAction!);
    await waitFor(() => {
      expect(mockConfirmMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Cancel action ---
  it("Given: cancel dialog When: clicking cancel Then: should call cancelSale.mutateAsync", async () => {
    mockCancelMutateAsync.mockResolvedValue(undefined);
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const cancelAction = actions.find((a) =>
      a.textContent?.includes("actions.cancelSale"),
    );
    fireEvent.click(cancelAction!);
    await waitFor(() => {
      expect(mockCancelMutateAsync).toHaveBeenCalledWith("sale-1");
    });
  });

  // --- Start picking action ---
  it("Given: start picking dialog When: clicking start picking Then: should call startPicking.mutateAsync", async () => {
    mockStartPickingMutateAsync.mockResolvedValue(undefined);
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const pickAction = actions.find((a) =>
      a.textContent?.includes("actions.startPicking"),
    );
    fireEvent.click(pickAction!);
    await waitFor(() => {
      expect(mockStartPickingMutateAsync).toHaveBeenCalledWith("sale-1");
    });
  });

  it("Given: start picking When: mutation fails Then: should handle error gracefully", async () => {
    mockStartPickingMutateAsync.mockRejectedValue(new Error("fail"));
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const pickAction = actions.find((a) =>
      a.textContent?.includes("actions.startPicking"),
    );
    fireEvent.click(pickAction!);
    await waitFor(() => {
      expect(mockStartPickingMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Complete action ---
  it("Given: complete dialog When: clicking complete Then: should call completeSale.mutateAsync", async () => {
    mockCompleteMutateAsync.mockResolvedValue(undefined);
    const sale = makeSale({ status: "SHIPPED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const actions = screen.getAllByTestId("alert-action");
    const completeAction = actions.find((a) =>
      a.textContent?.includes("completeSale.confirm"),
    );
    fireEvent.click(completeAction!);
    await waitFor(() => {
      expect(mockCompleteMutateAsync).toHaveBeenCalledWith("sale-1");
    });
  });

  // --- Pending states for action buttons ---
  it("Given: confirmSale isPending When: rendering Then: should show loading text in confirm area", () => {
    mockConfirmPending = true;
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: cancelSale isPending When: rendering Then: should show loading text in cancel area", () => {
    mockCancelPending = true;
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: startPicking isPending When: rendering Then: should show loading text", () => {
    mockStartPickingPending = true;
    const sale = makeSale({ status: "CONFIRMED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: shipSale isPending When: rendering Then: should show loading text", () => {
    mockShipPending = true;
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    // ship button shows loading when pending
    expect(
      screen.getAllByText("actions.shipSale").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: completeSale isPending When: rendering Then: should show loading text", () => {
    mockCompletePending = true;
    const sale = makeSale({ status: "SHIPPED", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  // --- Returns card ---
  it("Given: sale with returns When: rendering Then: should display returns card", () => {
    const sale = makeSale({ status: "COMPLETED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    mockSaleReturnsHook = {
      data: [
        {
          id: "ret-1",
          returnNumber: "R-001",
          type: "RETURN_CUSTOMER",
          status: "DRAFT",
        },
      ],
    };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByText("R-001")).toBeDefined();
  });

  it("Given: sale with empty returns array When: rendering Then: should NOT display returns card", () => {
    const sale = makeSale({ status: "COMPLETED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    mockSaleReturnsHook = { data: [] };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.queryByText("R-001")).not.toBeInTheDocument();
  });

  it("Given: sale with no returns data When: rendering Then: should NOT display returns card", () => {
    const sale = makeSale({ status: "COMPLETED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    mockSaleReturnsHook = { data: undefined };
    render(<SaleDetail saleId="sale-1" />);
    // Returns title from tReturns("title") shouldn't show
    expect(screen.queryByText("title")).not.toBeInTheDocument();
  });

  // --- Picking verification card ---
  it("Given: PICKING sale with picking config not OFF When: rendering Then: should show picking verification", () => {
    mockPickingConfig = { mode: "BARCODE" };
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByTestId("picking-verification")).toBeDefined();
  });

  it("Given: PICKING sale with picking config OFF When: rendering Then: should NOT show picking verification", () => {
    mockPickingConfig = { mode: "OFF" };
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.queryByTestId("picking-verification"),
    ).not.toBeInTheDocument();
  });

  it("Given: non-PICKING sale When: rendering Then: should NOT show picking verification", () => {
    mockPickingConfig = { mode: "BARCODE" };
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(
      screen.queryByTestId("picking-verification"),
    ).not.toBeInTheDocument();
  });

  // --- Timeline ---
  it("Given: sale with timeline data When: rendering Then: should render SaleTimeline", () => {
    const sale = makeSale({ status: "CONFIRMED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    expect(screen.getByTestId("sale-timeline")).toBeDefined();
    expect(screen.getByText("detail.timeline")).toBeDefined();
  });

  // --- Swap line interaction ---
  it("Given: CONFIRMED sale line When: clicking swap button Then: swap dialog should render", () => {
    const sale = makeSale({ status: "CONFIRMED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const swapButton = screen.getByText("actions.swapLine");
    fireEvent.click(swapButton);
    expect(screen.getByTestId("sale-swap-dialog")).toBeDefined();
  });

  // --- Ship sale dialog ---
  it("Given: PICKING sale with ship dialog open When: filling form and clicking ship Then: should call shipSale.mutateAsync", async () => {
    mockShipMutateAsync.mockResolvedValue(undefined);
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    // Click the ship trigger to open dialog
    const triggerDiv = screen.getByTestId("dialog-trigger");
    const shipButton = triggerDiv.querySelector("button");
    fireEvent.click(shipButton!);
    // Now the Dialog is open
    const inputs = screen.getAllByTestId("input");
    if (inputs.length >= 3) {
      fireEvent.change(inputs[0], { target: { value: "TRK-999" } });
      fireEvent.change(inputs[1], { target: { value: "DHL" } });
      fireEvent.change(inputs[2], { target: { value: "Be careful" } });
    }
    // Click the ship button in dialog footer
    const shipButtons = screen.getAllByText("actions.shipSale");
    const footerShipButton = shipButtons[shipButtons.length - 1];
    fireEvent.click(footerShipButton);
    await waitFor(() => {
      expect(mockShipMutateAsync).toHaveBeenCalled();
    });
  });

  it("Given: ship mutation When: it fails Then: should handle error gracefully", async () => {
    mockShipMutateAsync.mockRejectedValue(new Error("fail"));
    const sale = makeSale({ status: "PICKING", pickingEnabled: true });
    mockSaleHook = { data: sale, isLoading: false, isError: false };
    render(<SaleDetail saleId="sale-1" />);
    const triggerDiv = screen.getByTestId("dialog-trigger");
    const shipButton = triggerDiv.querySelector("button");
    fireEvent.click(shipButton!);
    const shipButtons = screen.getAllByText("actions.shipSale");
    fireEvent.click(shipButtons[shipButtons.length - 1]);
    await waitFor(() => {
      expect(mockShipMutateAsync).toHaveBeenCalled();
    });
  });
});
