import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TransferReceiveModal } from "@/modules/inventory/presentation/components/transfers/transfer-receive-modal";
import type { Transfer } from "@/modules/inventory/domain/entities/transfer.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockReceiveMutateAsync = vi.fn();
vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useReceiveTransfer: () => ({
    isPending: false,
    mutateAsync: mockReceiveMutateAsync,
  }),
}));

vi.mock("@/ui/components/dialog", () => ({
  Dialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open: boolean;
  }) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({
    children,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <div data-testid="dialog-content">{children}</div>,
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <h2 data-testid="dialog-title" className={className}>
      {children}
    </h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

// --- Helper ---

function createMockTransfer(): Transfer {
  return {
    id: "transfer-1",
    fromWarehouseId: "wh-1",
    fromWarehouseName: "Main",
    toWarehouseId: "wh-2",
    toWarehouseName: "Secondary",
    status: "IN_TRANSIT",
    notes: null,
    lines: [
      {
        id: "line-1",
        productId: "p1",
        productName: "Widget A",
        productSku: "WA-001",
        quantity: 10,
        receivedQuantity: null,
      },
      {
        id: "line-2",
        productId: "p2",
        productName: "Widget B",
        productSku: "WB-002",
        quantity: 5,
        receivedQuantity: null,
      },
    ],
    linesCount: 2,
    createdBy: "user-1",
    receivedBy: null,
    createdAt: new Date("2026-01-01"),
    completedAt: null,
  } as unknown as Transfer;
}

// --- Tests ---

describe("TransferReceiveModal", () => {
  const mockOnOpenChange = vi.fn();

  beforeEach(() => {
    mockOnOpenChange.mockClear();
    mockReceiveMutateAsync.mockClear();
  });

  it("Given: open is false When: rendering Then: should render nothing", () => {
    const transfer = createMockTransfer();

    const { container } = render(
      <TransferReceiveModal
        transfer={transfer}
        open={false}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(container.querySelector("[data-testid='dialog']")).toBeNull();
  });

  it("Given: open is true When: rendering Then: should show receive title and description", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(screen.getByText("receive.title")).toBeInTheDocument();
    expect(screen.getByText("receive.description")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should display product names and SKUs for each line", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("WA-001")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
    expect(screen.getByText("WB-002")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should display column headers for product, quantity, and received quantity", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(screen.getByText("fields.product")).toBeInTheDocument();
    expect(screen.getByText("fields.quantity")).toBeInTheDocument();
    expect(screen.getByText("fields.receivedQuantity")).toBeInTheDocument();
  });

  it("Given: open is true When: rendering Then: should show quantity inputs defaulting to line quantities", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    const inputs = screen.getAllByRole("spinbutton");
    expect(inputs).toHaveLength(2);
    expect(inputs[0]).toHaveValue(10);
    expect(inputs[1]).toHaveValue(5);
  });

  it("Given: open is true When: rendering Then: should show cancel and receive buttons", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    expect(screen.getByText("cancel")).toBeInTheDocument();
    expect(screen.getByText("actions.receive")).toBeInTheDocument();
  });

  it("Given: open is true When: clicking cancel Then: should call onOpenChange with false", () => {
    const transfer = createMockTransfer();

    render(
      <TransferReceiveModal
        transfer={transfer}
        open={true}
        onOpenChange={mockOnOpenChange}
      />,
    );

    fireEvent.click(screen.getByText("cancel"));
    expect(mockOnOpenChange).toHaveBeenCalledWith(false);
  });
});
