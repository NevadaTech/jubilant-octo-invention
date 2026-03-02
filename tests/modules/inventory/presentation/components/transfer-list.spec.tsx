import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransferList } from "@/modules/inventory/presentation/components/transfers/transfer-list";
import { Transfer, TransferLine } from "@/modules/inventory/domain/entities/transfer.entity";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

let mockQueryState: {
  data: { data: Transfer[]; pagination: { page: number; totalPages: number; total: number; limit: number } } | undefined;
  isLoading: boolean;
  isError: boolean;
} = { data: undefined, isLoading: false, isError: false };

vi.mock("@/modules/inventory/presentation/hooks/use-transfers", () => ({
  useTransfers: () => mockQueryState,
  useUpdateTransferStatus: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock("@/modules/inventory/presentation/components/transfers/transfer-status-badge", () => ({
  TransferStatusBadge: ({ status }: { status: string }) => <span data-testid="status-badge">{status}</span>,
}));

vi.mock("@/modules/inventory/presentation/components/transfers/transfer-filters", () => ({
  TransferFiltersComponent: () => <div data-testid="transfer-filters" />,
}));

vi.mock("@/modules/inventory/presentation/components/transfers/transfer-form", () => ({
  TransferForm: () => <div data-testid="transfer-form" />,
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: () => <div data-testid="table-pagination" />,
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({ label }: { label: string }) => <th>{label}</th>,
}));

// --- Helpers ---

function makeTransfer(overrides: Partial<{
  id: string;
  fromWarehouseName: string;
  toWarehouseName: string;
  status: "DRAFT" | "IN_TRANSIT" | "RECEIVED";
}> = {}): Transfer {
  const line = TransferLine.create({
    id: "line-1",
    productId: "p1",
    productName: "Widget A",
    productSku: "WA-001",
    quantity: 25,
    receivedQuantity: null,
  });

  return Transfer.create({
    id: overrides.id ?? "tf-1",
    fromWarehouseId: "wh-1",
    fromWarehouseName: overrides.fromWarehouseName ?? "Origin Warehouse",
    toWarehouseId: "wh-2",
    toWarehouseName: overrides.toWarehouseName ?? "Destination Warehouse",
    status: overrides.status ?? "DRAFT",
    notes: null,
    lines: [line],
    linesCount: 1,
    totalQuantity: 25,
    createdBy: "user-1",
    receivedBy: null,
    createdAt: new Date("2026-02-10T08:00:00Z"),
    completedAt: null,
  });
}

// --- Tests ---

describe("TransferList", () => {
  beforeEach(() => {
    mockQueryState = { data: undefined, isLoading: false, isError: false };
  });

  it("Given: data loaded When: rendering Then: should display the list title", () => {
    const tf = makeTransfer();
    mockQueryState = {
      data: { data: [tf], pagination: { page: 1, totalPages: 1, total: 1, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<TransferList />);

    expect(screen.getByText("list.title")).toBeDefined();
  });

  it("Given: transfers exist When: rendering Then: should render warehouse names and quantity for each row", () => {
    const tf1 = makeTransfer({ id: "tf-1", fromWarehouseName: "Warehouse Alpha", toWarehouseName: "Warehouse Beta" });
    const tf2 = makeTransfer({ id: "tf-2", fromWarehouseName: "Warehouse Gamma", toWarehouseName: "Warehouse Delta" });

    mockQueryState = {
      data: { data: [tf1, tf2], pagination: { page: 1, totalPages: 1, total: 2, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<TransferList />);

    expect(screen.getByText("Warehouse Alpha")).toBeDefined();
    expect(screen.getByText("Warehouse Beta")).toBeDefined();
    expect(screen.getByText("Warehouse Gamma")).toBeDefined();
    expect(screen.getByText("Warehouse Delta")).toBeDefined();
  });

  it("Given: transfers exist When: rendering Then: should render status badge and product name", () => {
    const tf = makeTransfer({ status: "DRAFT" });
    mockQueryState = {
      data: { data: [tf], pagination: { page: 1, totalPages: 1, total: 1, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<TransferList />);

    expect(screen.getByText("DRAFT")).toBeDefined();
    expect(screen.getByText(/Widget A/)).toBeDefined();
  });

  it("Given: no transfers When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: { data: [], pagination: { page: 1, totalPages: 0, total: 0, limit: 10 } },
      isLoading: false,
      isError: false,
    };

    render(<TransferList />);

    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: loading state When: rendering Then: should show skeleton placeholders", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };

    const { container } = render(<TransferList />);

    const skeletons = container.querySelectorAll(".h-16");
    expect(skeletons.length).toBe(5);
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };

    render(<TransferList />);

    expect(screen.getByText("error.loading")).toBeDefined();
  });
});
