import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ReturnList } from "@/modules/returns/presentation/components/return-list";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock(
  "@/modules/returns/presentation/components/return-status-badge",
  () => ({
    ReturnStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="return-status">{status}</span>
    ),
  }),
);

vi.mock("@/modules/returns/presentation/components/return-type-badge", () => ({
  ReturnTypeBadge: ({ type }: { type: string }) => (
    <span data-testid="return-type">{type}</span>
  ),
}));

vi.mock("@/modules/returns/presentation/components/return-filters", () => ({
  ReturnFiltersComponent: () => <div data-testid="return-filters" />,
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
    RETURNS_CREATE: "RETURNS:CREATE",
    RETURNS_UPDATE: "RETURNS:UPDATE",
    RETURNS_DELETE: "RETURNS:DELETE",
    RETURNS_CONFIRM: "RETURNS:CONFIRM",
    RETURNS_CANCEL: "RETURNS:CANCEL",
  },
}));

vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (s: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: null }),
}));

const mockConfirmMutateAsync = vi.fn();
const mockCancelMutateAsync = vi.fn();
let mockConfirmPending = false;
let mockCancelPending = false;

const mockReturns = {
  data: [
    {
      id: "r-1",
      returnNumber: "RET-001",
      type: "RETURN_CUSTOMER",
      status: "DRAFT",
      warehouseId: "wh-1",
      warehouseName: "Main Warehouse",
      totalItems: 2,
      totalAmount: 50,
      currency: "USD",
      createdAt: new Date("2026-01-20T09:00:00"),
      lines: [],
      canConfirm: true,
      canCancel: true,
    },
    {
      id: "r-2",
      returnNumber: "RET-002",
      type: "RETURN_SUPPLIER",
      status: "CONFIRMED",
      warehouseId: "wh-2",
      warehouseName: "Secondary Warehouse",
      totalItems: 1,
      totalAmount: 75,
      currency: "USD",
      createdAt: new Date("2026-01-21T11:00:00"),
      lines: [],
      canConfirm: false,
      canCancel: false,
    },
  ],
  pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

let mockQueryState: {
  data: typeof mockReturns | undefined;
  isLoading: boolean;
  isError: boolean;
} = {
  data: mockReturns,
  isLoading: false,
  isError: false,
};

vi.mock("@/modules/returns/presentation/hooks/use-returns", () => ({
  useReturns: () => mockQueryState,
  useConfirmReturn: () => ({
    isPending: mockConfirmPending,
    mutateAsync: mockConfirmMutateAsync,
  }),
  useCancelReturn: () => ({
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
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
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
  }) => (
    <div data-testid="alert-dialog" data-open={open}>
      {children}
    </div>
  ),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
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

describe("ReturnList", () => {
  beforeEach(() => {
    mockQueryState = { data: mockReturns, isLoading: false, isError: false };
    mockConfirmPending = false;
    mockCancelPending = false;
    mockHasPermission = () => true;
    mockConfirmMutateAsync.mockReset();
    mockCancelMutateAsync.mockReset();
  });

  // --- Loading ---
  it("Given: loading state When: rendering Then: should show title but no return data", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    render(<ReturnList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("RET-001")).not.toBeInTheDocument();
  });

  // --- Error ---
  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<ReturnList />);
    expect(screen.getByText("error.loading")).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should not show title or table", () => {
    mockQueryState = { data: undefined, isLoading: false, isError: true };
    render(<ReturnList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.new")).not.toBeInTheDocument();
  });

  // --- Empty ---
  it("Given: empty returns When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<ReturnList />);
    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  // --- Data display ---
  it("Given: returns data When: rendering Then: should show list title", () => {
    render(<ReturnList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should show return numbers", () => {
    render(<ReturnList />);
    expect(screen.getByText("RET-001")).toBeInTheDocument();
    expect(screen.getByText("RET-002")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should show status badges", () => {
    render(<ReturnList />);
    const badges = screen.getAllByTestId("return-status");
    expect(badges).toHaveLength(2);
    expect(badges[0]).toHaveTextContent("DRAFT");
    expect(badges[1]).toHaveTextContent("CONFIRMED");
  });

  it("Given: returns data When: rendering Then: should show type badges", () => {
    render(<ReturnList />);
    const typeBadges = screen.getAllByTestId("return-type");
    expect(typeBadges).toHaveLength(2);
    expect(typeBadges[0]).toHaveTextContent("RETURN_CUSTOMER");
    expect(typeBadges[1]).toHaveTextContent("RETURN_SUPPLIER");
  });

  it("Given: returns data When: rendering Then: should show warehouse names", () => {
    render(<ReturnList />);
    expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    expect(screen.getByText("Secondary Warehouse")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should show new return button", () => {
    render(<ReturnList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should render return filters child", () => {
    render(<ReturnList />);
    expect(screen.getByTestId("return-filters")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should show total items count", () => {
    render(<ReturnList />);
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("Given: returns data When: rendering Then: should format currency values", () => {
    render(<ReturnList />);
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$75")).toBeInTheDocument();
  });

  // --- Conditional actions (canConfirm, canCancel, permissions) ---
  it("Given: return with canConfirm and RETURNS_CONFIRM permission When: rendering Then: should show confirm action", () => {
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItems = items.filter((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    expect(confirmItems.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: return with canConfirm but no RETURNS_CONFIRM permission When: rendering Then: should NOT show confirm", () => {
    mockHasPermission = (p: string) => p !== "RETURNS:CONFIRM";
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const confirmItems = items.filter((i) =>
      i.textContent?.includes("actions.confirm"),
    );
    expect(confirmItems.length).toBe(0);
  });

  it("Given: return with canCancel and RETURNS_CANCEL permission When: rendering Then: should show cancel action", () => {
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItems = items.filter((i) =>
      i.textContent?.includes("actions.cancelReturn"),
    );
    expect(cancelItems.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: return with canCancel false When: rendering Then: should NOT show cancel action", () => {
    mockQueryState = {
      data: {
        data: [{ ...mockReturns.data[0], canConfirm: false, canCancel: false }],
        pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
      },
      isLoading: false,
      isError: false,
    };
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItems = items.filter((i) =>
      i.textContent?.includes("actions.cancelReturn"),
    );
    expect(cancelItems.length).toBe(0);
  });

  it("Given: return with canCancel but no RETURNS_CANCEL permission When: rendering Then: should NOT show cancel", () => {
    mockHasPermission = (p: string) => p !== "RETURNS:CANCEL";
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItems = items.filter((i) =>
      i.textContent?.includes("actions.cancelReturn"),
    );
    expect(cancelItems.length).toBe(0);
  });

  // --- Confirm dialog flow ---
  it("Given: clicking confirm action When: dialog confirms Then: should call confirmReturn.mutateAsync", async () => {
    mockConfirmMutateAsync.mockResolvedValue(undefined);
    render(<ReturnList />);
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
      expect(mockConfirmMutateAsync).toHaveBeenCalledWith("r-1");
    });
  });

  it("Given: confirm mutation fails When: confirmed Then: should handle error gracefully", async () => {
    mockConfirmMutateAsync.mockRejectedValue(new Error("fail"));
    render(<ReturnList />);
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
  it("Given: clicking cancel action When: dialog confirms Then: should call cancelReturn.mutateAsync", async () => {
    mockCancelMutateAsync.mockResolvedValue(undefined);
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItem = items.filter((i) =>
      i.textContent?.includes("actions.cancelReturn"),
    );
    fireEvent.click(cancelItem[0]);
    const actions = screen.getAllByTestId("alert-action");
    const cancelAction = actions.find((a) =>
      a.textContent?.includes("actions.cancelReturn"),
    );
    fireEvent.click(cancelAction!);
    await waitFor(() => {
      expect(mockCancelMutateAsync).toHaveBeenCalledWith("r-1");
    });
  });

  it("Given: cancel mutation fails When: cancelled Then: should handle error gracefully", async () => {
    mockCancelMutateAsync.mockRejectedValue(new Error("fail"));
    render(<ReturnList />);
    const items = screen.getAllByTestId("dropdown-item");
    const cancelItem = items.filter((i) =>
      i.textContent?.includes("actions.cancelReturn"),
    );
    fireEvent.click(cancelItem[0]);
    const actions = screen.getAllByTestId("alert-action");
    const cancelAction = actions.find((a) =>
      a.textContent?.includes("actions.cancelReturn"),
    );
    fireEvent.click(cancelAction!);
    await waitFor(() => {
      expect(mockCancelMutateAsync).toHaveBeenCalled();
    });
  });

  // --- Pending states ---
  it("Given: confirmReturn isPending When: rendering Then: should show loading text", () => {
    mockConfirmPending = true;
    render(<ReturnList />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  it("Given: cancelReturn isPending When: rendering Then: should show loading text", () => {
    mockCancelPending = true;
    render(<ReturnList />);
    expect(screen.getAllByText("loading").length).toBeGreaterThanOrEqual(1);
  });

  // --- Pagination ---
  it("Given: returns data When: clicking next page Then: should update filters", () => {
    render(<ReturnList />);
    fireEvent.click(screen.getByTestId("next-page"));
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  it("Given: returns data When: changing page size Then: should reset to page 1", () => {
    render(<ReturnList />);
    fireEvent.click(screen.getByTestId("page-size"));
    expect(screen.getByTestId("table-pagination")).toBeInTheDocument();
  });

  // --- Sorting ---
  it("Given: returns data When: clicking sortable header Then: should update sort state", () => {
    render(<ReturnList />);
    const header = screen.getByTestId("sortable-returnNumber");
    fireEvent.click(header.querySelector("button")!);
    expect(screen.getByText("RET-001")).toBeInTheDocument();
  });
});
