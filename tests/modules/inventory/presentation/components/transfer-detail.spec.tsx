import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransferDetail } from "@/modules/inventory/presentation/components/transfers/transfer-detail";
import {
  Transfer,
  TransferLine,
} from "@/modules/inventory/domain/entities/transfer.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}));

const mockUpdateStatusMutateAsync = vi.fn();

let mockTransferHook: {
  data: Transfer | undefined;
  isLoading: boolean;
  isError: boolean;
};

let mockUpdateStatusHook: {
  mutateAsync: typeof mockUpdateStatusMutateAsync;
  isPending: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useTransfer: () => mockTransferHook,
  useUpdateTransferStatus: () => mockUpdateStatusHook,
}));

vi.mock("@/modules/users/presentation/hooks/use-users", () => ({
  useUser: (userId: string) => ({
    data:
      userId === "user-1"
        ? { firstName: "Alice", lastName: "Smith" }
        : userId === "user-2"
          ? { firstName: "Bob", lastName: "Jones" }
          : undefined,
  }),
}));

vi.mock(
  "@/modules/inventory/presentation/components/transfers/transfer-status-badge",
  () => ({
    TransferStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="transfer-status-badge">{status}</span>
    ),
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/transfers/transfer-timeline",
  () => ({
    TransferTimeline: ({ status }: { status: string }) => (
      <div data-testid="transfer-timeline">{status}</div>
    ),
  }),
);

vi.mock(
  "@/modules/inventory/presentation/components/transfers/transfer-receive-modal",
  () => ({
    TransferReceiveModal: ({
      open,
      onOpenChange,
    }: {
      open: boolean;
      onOpenChange: (v: boolean) => void;
      transfer: Transfer;
    }) =>
      open ? (
        <div data-testid="receive-modal">
          <button onClick={() => onOpenChange(false)}>close</button>
        </div>
      ) : null,
  }),
);

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    asChild,
    className,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    asChild?: boolean;
    className?: string;
    variant?: string;
    size?: string;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={className}
        {...rest}
      >
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
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

// --- Helpers ---

function makeTransferLine(
  overrides: Partial<{
    id: string;
    productName: string;
    productSku: string;
    quantity: number;
    receivedQuantity: number | null;
  }> = {},
): TransferLine {
  return TransferLine.create({
    id: overrides.id ?? "tl-1",
    productId: "p-1",
    productName: overrides.productName ?? "Part Alpha",
    productSku: overrides.productSku ?? "PA-001",
    quantity: overrides.quantity ?? 10,
    receivedQuantity:
      overrides.receivedQuantity !== undefined
        ? overrides.receivedQuantity
        : null,
  });
}

function makeTransfer(
  overrides: Partial<{
    id: string;
    status:
      | "DRAFT"
      | "IN_TRANSIT"
      | "PARTIAL"
      | "RECEIVED"
      | "REJECTED"
      | "CANCELED";
    fromWarehouseName: string;
    toWarehouseName: string;
    notes: string | null;
    lines: TransferLine[];
    createdBy: string;
    receivedBy: string | null;
    completedAt: Date | null;
  }> = {},
): Transfer {
  return Transfer.create({
    id: overrides.id ?? "tf-1234abcd-xxxx",
    fromWarehouseId: "wh-from",
    fromWarehouseName: overrides.fromWarehouseName ?? "Origin Warehouse",
    toWarehouseId: "wh-to",
    toWarehouseName: overrides.toWarehouseName ?? "Destination Warehouse",
    status: overrides.status ?? "DRAFT",
    notes: overrides.notes ?? null,
    lines: overrides.lines ?? [makeTransferLine()],
    linesCount: (overrides.lines ?? [makeTransferLine()]).length,
    createdBy: overrides.createdBy ?? "user-1",
    receivedBy: overrides.receivedBy ?? null,
    createdAt: new Date("2026-02-25T10:00:00Z"),
    completedAt: overrides.completedAt ?? null,
  });
}

// --- Tests ---

describe("TransferDetail", () => {
  beforeEach(() => {
    mockUpdateStatusMutateAsync.mockClear();
    mockTransferHook = {
      data: undefined,
      isLoading: false,
      isError: false,
    };
    mockUpdateStatusHook = {
      mutateAsync: mockUpdateStatusMutateAsync,
      isPending: false,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockTransferHook = {
      data: undefined,
      isLoading: true,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(4);
  });

  it("Given: error state When: rendering Then: should display not found message and back link", () => {
    // Arrange
    mockTransferHook = {
      data: undefined,
      isLoading: false,
      isError: true,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("detail.notFound")).toBeDefined();
    expect(screen.getByText("detail.notFoundDescription")).toBeDefined();
    const backLink = screen.getByRole("link");
    expect(backLink.getAttribute("href")).toContain("/transfers");
  });

  it("Given: DRAFT transfer loaded When: rendering Then: should display warehouse names, status badge, and action buttons", () => {
    // Arrange
    const transfer = makeTransfer({
      status: "DRAFT",
      fromWarehouseName: "Factory A",
      toWarehouseName: "Store B",
    });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("Factory A")).toBeDefined();
    expect(screen.getByText("Store B")).toBeDefined();
    expect(screen.getByTestId("transfer-status-badge")).toBeDefined();
    expect(screen.getAllByText("DRAFT").length).toBeGreaterThanOrEqual(1);
    // DRAFT can start transit and cancel
    expect(screen.getByText("actions.startTransit")).toBeDefined();
    expect(screen.getByText("actions.cancel")).toBeDefined();
  });

  it("Given: IN_TRANSIT transfer When: rendering Then: should show receive and reject buttons", () => {
    // Arrange
    const transfer = makeTransfer({ status: "IN_TRANSIT" });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("actions.receive")).toBeDefined();
    expect(screen.getByText("actions.reject")).toBeDefined();
  });

  it("Given: transfer with lines When: rendering Then: should display product table with names, SKUs, and quantities", () => {
    // Arrange
    const lines = [
      makeTransferLine({
        id: "tl-1",
        productName: "Motor X",
        productSku: "MX-01",
        quantity: 15,
      }),
      makeTransferLine({
        id: "tl-2",
        productName: "Motor Y",
        productSku: "MY-02",
        quantity: 8,
      }),
    ];
    const transfer = makeTransfer({ lines });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("Motor X")).toBeDefined();
    expect(screen.getByText("MX-01")).toBeDefined();
    expect(screen.getByText("Motor Y")).toBeDefined();
    expect(screen.getByText("MY-02")).toBeDefined();
    expect(screen.getByText("detail.products")).toBeDefined();
  });

  it("Given: transfer with notes When: rendering Then: should display notes text", () => {
    // Arrange
    const transfer = makeTransfer({ notes: "Priority shipment" });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("Priority shipment")).toBeDefined();
    expect(screen.getByText("fields.notes")).toBeDefined();
  });

  it("Given: transfer with createdBy user When: rendering Then: should resolve user name via useUser hook", () => {
    // Arrange
    const transfer = makeTransfer({ createdBy: "user-1" });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByText("Alice Smith")).toBeDefined();
  });

  it("Given: DRAFT transfer When: clicking start transit button Then: should call updateStatus with IN_TRANSIT", async () => {
    // Arrange
    mockUpdateStatusMutateAsync.mockResolvedValue({});
    const transfer = makeTransfer({ status: "DRAFT" });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);
    const startTransitBtn = screen.getByText("actions.startTransit");
    fireEvent.click(startTransitBtn);

    // Assert
    expect(mockUpdateStatusMutateAsync).toHaveBeenCalledWith({
      id: "tf-1",
      status: "IN_TRANSIT",
    });
  });

  it("Given: transfer with timeline data When: rendering Then: should render the TransferTimeline component", () => {
    // Arrange
    const transfer = makeTransfer({ status: "IN_TRANSIT" });
    mockTransferHook = {
      data: transfer,
      isLoading: false,
      isError: false,
    };

    // Act
    render(<TransferDetail transferId="tf-1" />);

    // Assert
    expect(screen.getByTestId("transfer-timeline")).toBeDefined();
    expect(screen.getByText("detail.timeline")).toBeDefined();
  });
});
