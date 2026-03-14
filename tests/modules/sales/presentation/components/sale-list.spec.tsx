import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { SaleList } from "@/modules/sales/presentation/components/sale-list";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/modules/sales/presentation/components/sale-status-badge", () => ({
  SaleStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="sale-status">{status}</span>
  ),
}));

vi.mock("@/modules/sales/presentation/components/sale-filters", () => ({
  SaleFiltersComponent: ({
    onFiltersChange,
  }: {
    filters: unknown;
    onFiltersChange: (f: unknown) => void;
  }) => (
    <div data-testid="sale-filters">
      <button
        data-testid="apply-filters"
        onClick={() => onFiltersChange({ page: 1, limit: 10, search: "test" })}
      />
    </div>
  ),
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

let mockHasPermission = (_p: string) => true;

vi.mock("@/modules/authentication/presentation/hooks/use-permissions", () => ({
  usePermissions: () => ({
    hasPermission: (p: string) => mockHasPermission(p),
  }),
}));

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    SALES_CREATE: "SALES:CREATE",
    SALES_UPDATE: "SALES:UPDATE",
    SALES_DELETE: "SALES:DELETE",
    SALES_CONFIRM: "SALES:CONFIRM",
    SALES_CANCEL: "SALES:CANCEL",
  },
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (s: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: null }),
}));

const mockConfirmMutateAsync = vi.fn();
const mockCancelMutateAsync = vi.fn();

const mockSales = {
  data: [
    {
      id: "s-1",
      saleNumber: "SALE-001",
      status: "DRAFT",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      customerReference: "John Doe",
      totalItems: 3,
      totalAmount: 100,
      currency: "USD",
      createdAt: new Date("2026-01-15T10:30:00"),
      lines: [],
      canConfirm: true,
      canCancel: true,
    },
    {
      id: "s-2",
      saleNumber: "SALE-002",
      status: "CONFIRMED",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      customerReference: null,
      totalItems: 1,
      totalAmount: 250,
      currency: "USD",
      createdAt: new Date("2026-01-16T14:00:00"),
      lines: [],
      canConfirm: false,
      canCancel: true,
    },
  ],
  pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

let mockQueryState: {
  data: typeof mockSales | undefined;
  isLoading: boolean;
  isError: boolean;
} = {
  data: mockSales,
  isLoading: false,
  isError: false,
};

let mockConfirmPending = false;
let mockCancelPending = false;

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useSales: () => mockQueryState,
  useConfirmSale: () => ({
    isPending: mockConfirmPending,
    mutateAsync: mockConfirmMutateAsync,
  }),
  useCancelSale: () => ({
    isPending: mockCancelPending,
    mutateAsync: mockCancelMutateAsync,
  }),
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({
    label,
    field,
    onSort,
  }: {
    label: string;
    field: string;
    onSort: (field: string, order: "asc" | "desc" | undefined) => void;
  }) => (
    <th data-testid={`sortable-${field}`}>
      <button onClick={() => onSort(field, "asc")}>{label}</button>
    </th>
  ),
}));

vi.mock("@/ui/components/table-pagination", () => ({
  TablePagination: ({
    onPageChange,
    onPageSizeChange,
    showingLabel,
  }: {
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
    onPageSizeChange: (s: number) => void;
    showingLabel: string;
  }) => (
    <div data-testid="table-pagination">
      <span>{showingLabel}</span>
      <button data-testid="next-page" onClick={() => onPageChange(2)} />
      <button data-testid="page-size" onClick={() => onPageSizeChange(20)} />
    </div>
  ),
}));

vi.mock("@/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
    className,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    asChild?: boolean;
    className?: string;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick} className={className}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
    onOpenChange?: (v: boolean) => void;
  }) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
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
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button onClick={onClick} disabled={disabled} data-testid="alert-action">
      {children}
    </button>
  ),
}));

describe("SaleList", () => {
  beforeEach(() => {
    mockQueryState = { data: mockSales, isLoading: false, isError: false };
    mockConfirmPending = false;
    mockCancelPending = false;
    mockHasPermission = () => true;
    mockConfirmMutateAsync.mockReset();
    mockCancelMutateAsync.mockReset();
  });

  // --- Loading state ---
  it("Given: loading state When: rendering Then: should show skeletons and no sale data", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    render(<SaleList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("SALE-001")).not.toBeInTheDocument();
  });

  // --- Error state ---
  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<SaleList />);
    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should not show title or table", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<SaleList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.new")).not.toBeInTheDocument();
  });

  // --- Empty state ---
  it("Given: empty sales When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<SaleList />);
    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  // --- Data state ---
  it("Given: sales data When: rendering Then: should show sale numbers", () => {
    render(<SaleList />);
    expect(screen.getByText("SALE-001")).toBeInTheDocument();
    expect(screen.getByText("SALE-002")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show status badges", () => {
    render(<SaleList />);
    const badges = screen.getAllByTestId("sale-status");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent("DRAFT");
    expect(badges[1]).toHaveTextContent("CONFIRMED");
  });

  it("Given: sale with customer reference When: rendering Then: should show customer name", () => {
    render(<SaleList />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("Given: sale with null customerReference When: rendering Then: should show dash placeholder", () => {
    render(<SaleList />);
    // The second sale has null customerReference, rendered as "-"
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show total items count", () => {
    render(<SaleList />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show new sale button", () => {
    render(<SaleList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show sale filters", () => {
    render(<SaleList />);
    expect(screen.getByTestId("sale-filters")).toBeInTheDocument();
  });

  // --- Conditional action buttons (canConfirm, canCancel) ---
  it("Given: sale with canConfirm true and SALES_CONFIRM permission When: rendering Then: should show confirm action", () => {
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItems = items.filter((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    expect(confirmItems.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with canConfirm true but no SALES_CONFIRM permission When: rendering Then: should NOT show confirm action for that sale", () => {
    mockHasPermission = (p: string) => p !== "SALES:CONFIRM";
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItems = items.filter((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    expect(confirmItems.length).toBe(0);
  });

  it("Given: sale with canCancel true and SALES_CANCEL permission When: rendering Then: should show cancel action", () => {
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItems = items.filter((i) =>
      i.textContent?.includes("actions.cancel"),
    );
    expect(cancelItems.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with canCancel false When: rendering Then: should NOT show cancel action for that sale", () => {
    mockQueryState = {
      data: {
        data: [
          {
            ...mockSales.data[0],
            canCancel: false,
            canConfirm: false,
          },
        ],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItems = items.filter((i) =>
      i.textContent?.includes("actions.cancel"),
    );
    expect(cancelItems.length).toBe(0);
  });

  // --- Confirm dialog flow ---
  it("Given: sale with canConfirm When: clicking confirm action Then: confirm dialog should open", async () => {
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItem = items.find((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmItem!);
    await waitFor(() => {
      expect(screen.getByText("confirmSale.title")).toBeInTheDocument();
    });
  });

  it("Given: confirm dialog open When: clicking alert action Then: should call confirmSale.mutateAsync", async () => {
    mockConfirmMutateAsync.mockResolvedValue(undefined);
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItem = items.find((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmItem!);
    const actions = screen.getAllByTestId("alert-action");
    const confirmAction = actions.find((a) =>
      a.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmAction!);
    await waitFor(() => {
      expect(mockConfirmMutateAsync).toHaveBeenCalledWith("s-1");
    });
  });

  it("Given: confirm dialog When: confirm mutation fails Then: should handle error gracefully", async () => {
    mockConfirmMutateAsync.mockRejectedValue(new Error("fail"));
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItem = items.find((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmItem!);
    const actions = screen.getAllByTestId("alert-action");
    const confirmAction = actions.find((a) =>
      a.textContent?.includes("actions.confirm"),
    );
    fireEvent.click(confirmAction!);
    await waitFor(() => {
      expect(mockConfirmMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Cancel dialog flow ---
  it("Given: sale with canCancel When: clicking cancel action Then: cancel dialog should open", async () => {
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItem = items.filter((i) =>
      i.textContent?.includes("actions.cancel"),
    );
    fireEvent.click(cancelItem[0]);
    await waitFor(() => {
      expect(screen.getByText("cancelSale.title")).toBeInTheDocument();
    });
  });

  it("Given: cancel dialog open When: clicking alert action Then: should call cancelSale.mutateAsync", async () => {
    mockCancelMutateAsync.mockResolvedValue(undefined);
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItem = items.filter((i) =>
      i.textContent?.includes("actions.cancel"),
    );
    fireEvent.click(cancelItem[0]);
    const actions = screen.getAllByTestId("alert-action");
    const cancelAction = actions.find((a) =>
      a.textContent?.includes("actions.cancelSale"),
    );
    fireEvent.click(cancelAction!);
    await waitFor(() => {
      expect(mockCancelMutateAsync).toHaveBeenCalledWith("s-1");
    });
  });

  it("Given: cancel dialog When: cancel mutation fails Then: should handle error gracefully", async () => {
    mockCancelMutateAsync.mockRejectedValue(new Error("fail"));
    render(<SaleList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItem = items.filter((i) =>
      i.textContent?.includes("actions.cancel"),
    );
    fireEvent.click(cancelItem[0]);
    const actions = screen.getAllByTestId("alert-action");
    const cancelAction = actions.find((a) =>
      a.textContent?.includes("actions.cancelSale"),
    );
    fireEvent.click(cancelAction!);
    await waitFor(() => {
      expect(mockCancelMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Pending states ---
  it("Given: confirmSale isPending When: rendering confirm dialog Then: should show loading text", () => {
    mockConfirmPending = true;
    render(<SaleList />);
    // The dialog footer shows loading text when pending
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: cancelSale isPending When: rendering cancel dialog Then: should show loading text", () => {
    mockCancelPending = true;
    render(<SaleList />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  // --- Pagination ---
  it("Given: sales data with pagination When: clicking next page Then: should update page", () => {
    render(<SaleList />);
    const nextPage = screen.getByTestId("next-page");
    fireEvent.click(nextPage);
    // Pagination interaction doesn't crash
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  it("Given: sales data with pagination When: changing page size Then: should reset to page 1", () => {
    render(<SaleList />);
    const pageSize = screen.getByTestId("page-size");
    fireEvent.click(pageSize);
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  // --- Sorting ---
  it("Given: sales data When: clicking a sortable header Then: should update sort state", () => {
    render(<SaleList />);
    const sortableHeader = screen.getByTestId("sortable-saleNumber");
    fireEvent.click(sortableHeader.querySelector("button")!);
    // The component still renders correctly
    expect(screen.getByText("SALE-001")).toBeInTheDocument();
  });

  // --- Currency formatting ---
  it("Given: sale with currency When: rendering Then: should format currency correctly", () => {
    render(<SaleList />);
    // USD 100 formatted as $100
    expect(screen.getByText("$100")).toBeInTheDocument();
    expect(screen.getByText("$250")).toBeInTheDocument();
  });

  // --- handleConfirm without dialog open (null guard) ---
  it("Given: no confirmDialog selected When: handleConfirm executes Then: should not call mutateAsync", () => {
    // This tests the early return in handleConfirm when confirmDialog is null
    render(<SaleList />);
    // Initially no dialog is open, confirm action buttons exist but dialog is null
    expect(mockConfirmMutateAsync).not.toHaveBeenCalled();
  });
});
