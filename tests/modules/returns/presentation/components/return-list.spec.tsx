import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReturnList } from "@/modules/returns/presentation/components/return-list";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock(
  "@/modules/returns/presentation/components/return-status-badge",
  () => ({
    ReturnStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="return-status">{status}</span>
    ),
  }),
);

vi.mock(
  "@/modules/returns/presentation/components/return-type-badge",
  () => ({
    ReturnTypeBadge: ({ type }: { type: string }) => (
      <span data-testid="return-type">{type}</span>
    ),
  }),
);

vi.mock("@/modules/returns/presentation/components/return-filters", () => ({
  ReturnFiltersComponent: () => <div data-testid="return-filters" />,
}));

vi.mock("@/shared/presentation/components/permission-gate", () => ({
  PermissionGate: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock(
  "@/modules/authentication/presentation/hooks/use-permissions",
  () => ({
    usePermissions: () => ({ hasPermission: () => true }),
  }),
);

vi.mock("@/shared/domain/permissions", () => ({
  PERMISSIONS: {
    RETURNS_CREATE: "RETURNS:CREATE",
    RETURNS_UPDATE: "RETURNS:UPDATE",
    RETURNS_DELETE: "RETURNS:DELETE",
    RETURNS_CONFIRM: "RETURNS:CONFIRM",
    RETURNS_CANCEL: "RETURNS:CANCEL",
  },
}));

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
  useConfirmReturn: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCancelReturn: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe("ReturnList", () => {
  beforeEach(() => {
    mockQueryState = { data: mockReturns, isLoading: false, isError: false };
  });

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

  it("Given: loading state When: rendering Then: should show title but no return data", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    render(<ReturnList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("RET-001")).not.toBeInTheDocument();
  });

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
});
