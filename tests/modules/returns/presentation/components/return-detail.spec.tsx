import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnDetail } from "@/modules/returns/presentation/components/return-detail";
import {
  Return,
  ReturnLine,
} from "@/modules/returns/domain/entities/return.entity";

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

let mockReturnHook: {
  data: Return | undefined;
  isLoading: boolean;
  isError: boolean;
};

vi.mock("@/modules/returns/presentation/hooks/use-returns", () => ({
  useReturn: () => mockReturnHook,
  useConfirmReturn: () => ({
    mutateAsync: mockConfirmMutateAsync,
    isPending: false,
  }),
  useCancelReturn: () => ({
    mutateAsync: mockCancelMutateAsync,
    isPending: false,
  }),
}));

vi.mock(
  "@/modules/returns/presentation/components/return-status-badge",
  () => ({
    ReturnStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="return-status-badge">{status}</span>
    ),
  }),
);

vi.mock("@/modules/returns/presentation/components/return-type-badge", () => ({
  ReturnTypeBadge: ({ type }: { type: string }) => (
    <span data-testid="return-type-badge">{type}</span>
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
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  ),
}));

// --- Helpers ---

function makeReturnLine(
  overrides: Partial<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    originalSalePrice: number | null;
    originalUnitCost: number | null;
    totalPrice: number;
  }> = {},
): ReturnLine {
  return ReturnLine.create({
    id: overrides.id ?? "rl-1",
    productId: "p-1",
    productName: overrides.productName ?? "Return Widget",
    productSku: overrides.productSku ?? "RW-001",
    quantity: overrides.quantity ?? 2,
    originalSalePrice:
      overrides.originalSalePrice !== undefined
        ? overrides.originalSalePrice
        : 100,
    originalUnitCost:
      overrides.originalUnitCost !== undefined
        ? overrides.originalUnitCost
        : null,
    currency: "USD",
    totalPrice: overrides.totalPrice ?? 200,
  });
}

function makeReturn(
  overrides: Partial<{
    id: string;
    returnNumber: string;
    status: "DRAFT" | "CONFIRMED" | "CANCELLED";
    type: "RETURN_CUSTOMER" | "RETURN_SUPPLIER";
    warehouseName: string;
    saleNumber: string | null;
    reason: string | null;
    note: string | null;
    totalAmount: number;
    lines: ReturnLine[];
    confirmedAt: Date | null;
    cancelledAt: Date | null;
  }> = {},
): Return {
  return Return.create({
    id: overrides.id ?? "ret-1",
    returnNumber: overrides.returnNumber ?? "R-2026-0001",
    status: overrides.status ?? "DRAFT",
    type: overrides.type ?? "RETURN_CUSTOMER",
    reason: overrides.reason ?? null,
    warehouseId: "wh-1",
    warehouseName: overrides.warehouseName ?? "Main Warehouse",
    saleId: "sale-1",
    saleNumber: overrides.saleNumber ?? "S-2026-0001",
    sourceMovementId: null,
    returnMovementId: null,
    note: overrides.note ?? null,
    totalAmount: overrides.totalAmount ?? 400,
    currency: "USD",
    lines: overrides.lines ?? [makeReturnLine()],
    createdBy: "user-1",
    createdAt: new Date("2026-02-25T10:00:00Z"),
    confirmedAt: overrides.confirmedAt ?? null,
    cancelledAt: overrides.cancelledAt ?? null,
  });
}

// --- Tests ---

describe("ReturnDetail", () => {
  beforeEach(() => {
    mockConfirmMutateAsync.mockClear();
    mockCancelMutateAsync.mockClear();
    mockReturnHook = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockReturnHook = { data: undefined, isLoading: true, isError: false };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBe(3);
  });

  it("Given: error state When: rendering Then: should display error message and back link", () => {
    // Arrange
    mockReturnHook = { data: undefined, isLoading: false, isError: true };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.getByText("error.loading")).toBeDefined();
    const backLink = screen.getByRole("link");
    expect(backLink.getAttribute("href")).toContain("/returns");
  });

  it("Given: DRAFT customer return loaded When: rendering Then: should display return number, status badge, type badge, and warehouse", () => {
    // Arrange
    const returnData = makeReturn({
      returnNumber: "R-2026-0042",
      status: "DRAFT",
      type: "RETURN_CUSTOMER",
      warehouseName: "East Warehouse",
    });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.getByText("R-2026-0042")).toBeDefined();
    expect(screen.getByTestId("return-status-badge")).toBeDefined();
    expect(screen.getByText("DRAFT")).toBeDefined();
    expect(screen.getByTestId("return-type-badge")).toBeDefined();
    expect(screen.getByText("RETURN_CUSTOMER")).toBeDefined();
    expect(screen.getByText("East Warehouse")).toBeDefined();
  });

  it("Given: DRAFT return with lines When: rendering Then: should show confirm and cancel action buttons", () => {
    // Arrange
    const returnData = makeReturn({ status: "DRAFT" });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert - confirm text may appear in both button and dialog trigger
    expect(
      screen.getAllByText("actions.confirm").length,
    ).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText("actions.cancelReturn").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("Given: return with lines When: rendering Then: should display product names, SKUs, quantities, and total in the lines table", () => {
    // Arrange
    const lines = [
      makeReturnLine({
        id: "rl-1",
        productName: "Gadget X",
        productSku: "GX-01",
        quantity: 3,
        originalSalePrice: 150,
        totalPrice: 450,
      }),
      makeReturnLine({
        id: "rl-2",
        productName: "Gadget Y",
        productSku: "GY-02",
        quantity: 1,
        originalSalePrice: 200,
        totalPrice: 200,
      }),
    ];
    const returnData = makeReturn({ lines, totalAmount: 650 });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.getByText("Gadget X")).toBeDefined();
    expect(screen.getByText("GX-01")).toBeDefined();
    expect(screen.getByText("Gadget Y")).toBeDefined();
    expect(screen.getByText("GY-02")).toBeDefined();
    // Total amount may appear in both summary card and table footer
    expect(screen.getAllByText("$650").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: return with sale reference When: rendering Then: should display the sale number", () => {
    // Arrange
    const returnData = makeReturn({ saleNumber: "S-2026-0099" });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.getByText("fields.saleReference")).toBeDefined();
    expect(screen.getByText("S-2026-0099")).toBeDefined();
  });

  it("Given: return with reason and note When: rendering Then: should display both fields", () => {
    // Arrange
    const returnData = makeReturn({
      reason: "Defective item",
      note: "Customer reported malfunction",
    });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.getByText("Defective item")).toBeDefined();
    expect(screen.getByText("Customer reported malfunction")).toBeDefined();
  });

  it("Given: CONFIRMED return When: rendering Then: should not show confirm button (canConfirm is false)", () => {
    // Arrange
    const returnData = makeReturn({
      status: "CONFIRMED",
      confirmedAt: new Date("2026-02-26T15:00:00Z"),
    });
    mockReturnHook = {
      data: returnData,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<ReturnDetail returnId="ret-1" />);

    // Assert
    expect(screen.queryByText("actions.confirm")).toBeNull();
    expect(screen.getByText("CONFIRMED")).toBeDefined();
  });
});
