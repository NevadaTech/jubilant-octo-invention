import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaleDetail } from "@/modules/sales/presentation/components/sale-detail";
import { Sale, SaleLine } from "@/modules/sales/domain/entities/sale.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
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
  useConfirmSale: () => ({
    mutateAsync: mockConfirmMutateAsync,
    isPending: false,
  }),
  useCancelSale: () => ({
    mutateAsync: mockCancelMutateAsync,
    isPending: false,
  }),
  useStartPicking: () => ({
    mutateAsync: mockStartPickingMutateAsync,
    isPending: false,
  }),
  useShipSale: () => ({
    mutateAsync: mockShipMutateAsync,
    isPending: false,
  }),
  useCompleteSale: () => ({
    mutateAsync: mockCompleteMutateAsync,
    isPending: false,
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

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    variant?: string;
    size?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} disabled={disabled} {...rest}>
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
    asChild,
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
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button>{children}</button>
  ),
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
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div data-testid="ship-dialog">{children}</div> : null),
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
    asChild,
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
    totalAmount: number;
    lines: SaleLine[];
    trackingNumber: string | null;
    shippingCarrier: string | null;
    shippingNotes: string | null;
    note: string | null;
  }> = {},
): Sale {
  return Sale.create({
    id: overrides.id ?? "sale-1",
    saleNumber: overrides.saleNumber ?? "S-2026-0001",
    status: overrides.status ?? "DRAFT",
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Main Warehouse",
    customerReference: overrides.customerReference ?? "CUST-REF-01",
    externalReference: "EXT-001",
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
    pickingEnabled: true,
  });
}

// --- Tests ---

describe("SaleDetail", () => {
  beforeEach(() => {
    mockConfirmMutateAsync.mockClear();
    mockCancelMutateAsync.mockClear();
    mockSaleHook = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
    mockSaleReturnsHook = { data: undefined };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockSaleHook = { data: undefined, isLoading: true, isError: false };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("Given: error state When: rendering Then: should display error message and back link", () => {
    // Arrange
    mockSaleHook = { data: undefined, isLoading: false, isError: true };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByText("error.loading")).toBeDefined();
    const backLink = screen.getByRole("link");
    expect(backLink.getAttribute("href")).toContain("/sales");
  });

  it("Given: sale loaded in DRAFT status When: rendering Then: should display sale number, status badge, warehouse, and total", () => {
    // Arrange
    const sale = makeSale({
      saleNumber: "S-2026-0042",
      status: "DRAFT",
      warehouseName: "East Warehouse",
      totalAmount: 2500,
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByText("S-2026-0042")).toBeDefined();
    expect(screen.getByTestId("sale-status-badge")).toBeDefined();
    // "DRAFT" appears in both status badge and timeline mock
    expect(screen.getAllByText("DRAFT").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("East Warehouse")).toBeDefined();
    // Total amount appears in both summary card and table footer
    expect(screen.getAllByText("$2,500").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with lines When: rendering Then: should display product names, quantities, and prices in the lines table", () => {
    // Arrange
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

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByText("Gadget X")).toBeDefined();
    expect(screen.getByText("GX-01")).toBeDefined();
    expect(screen.getByText("Gadget Y")).toBeDefined();
    expect(screen.getByText("GY-02")).toBeDefined();
  });

  it("Given: DRAFT sale with lines When: rendering Then: should show confirm and cancel action buttons", () => {
    // Arrange
    const sale = makeSale({ status: "DRAFT" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert - canConfirm and canCancel should be true for DRAFT
    // confirm text may appear in both button and AlertDialog trigger
    expect(
      screen.getAllByText("actions.confirm").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("actions.cancelSale").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with shipping details When: rendering Then: should display tracking number, carrier, and notes", () => {
    // Arrange
    const sale = makeSale({
      status: "SHIPPED",
      trackingNumber: "TRK-123456",
      shippingCarrier: "FedEx",
      shippingNotes: "Handle with care",
    });
    mockSaleHook = { data: sale, isLoading: false, isError: false };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByText("detail.shippingDetails")).toBeDefined();
    expect(screen.getByText("TRK-123456")).toBeDefined();
    expect(screen.getByText("FedEx")).toBeDefined();
    expect(screen.getByText("Handle with care")).toBeDefined();
  });

  it("Given: sale with associated returns When: rendering Then: should display returns card with return numbers", () => {
    // Arrange
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

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByText("R-001")).toBeDefined();
    expect(screen.getByText("actions.view")).toBeDefined();
  });

  it("Given: sale with timeline data When: rendering Then: should render the SaleTimeline component", () => {
    // Arrange
    const sale = makeSale({ status: "CONFIRMED" });
    mockSaleHook = { data: sale, isLoading: false, isError: false };

    // Act
    render(<SaleDetail saleId="sale-1" />);

    // Assert
    expect(screen.getByTestId("sale-timeline")).toBeDefined();
    expect(screen.getByText("detail.timeline")).toBeDefined();
  });
});
