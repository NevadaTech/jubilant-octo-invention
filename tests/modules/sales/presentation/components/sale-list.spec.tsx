import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { SaleList } from "@/modules/sales/presentation/components/sale-list";

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

vi.mock("@/modules/sales/presentation/components/sale-status-badge", () => ({
  SaleStatusBadge: ({ status }: { status: string }) => (
    <span data-testid="sale-status">{status}</span>
  ),
}));

vi.mock("@/modules/sales/presentation/components/sale-filters", () => ({
  SaleFiltersComponent: () => <div data-testid="sale-filters" />,
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
    SALES_CREATE: "SALES:CREATE",
    SALES_UPDATE: "SALES:UPDATE",
    SALES_DELETE: "SALES:DELETE",
    SALES_CONFIRM: "SALES:CONFIRM",
    SALES_CANCEL: "SALES:CANCEL",
  },
}));

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

vi.mock("@/modules/sales/presentation/hooks/use-sales", () => ({
  useSales: () => mockQueryState,
  useConfirmSale: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useCancelSale: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

describe("SaleList", () => {
  beforeEach(() => {
    mockQueryState = { data: mockSales, isLoading: false, isError: false };
  });

  it("Given: sales data When: rendering Then: should show list title", () => {
    render(<SaleList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

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

  it("Given: sales data When: rendering Then: should show warehouse name", () => {
    render(<SaleList />);
    const warehouseNames = screen.getAllByText("Main Warehouse");
    expect(warehouseNames.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: sale with customer reference When: rendering Then: should show customer name", () => {
    render(<SaleList />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show new sale button", () => {
    render(<SaleList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should render sale filters child", () => {
    render(<SaleList />);
    expect(screen.getByTestId("sale-filters")).toBeInTheDocument();
  });

  it("Given: sales data When: rendering Then: should show total items count", () => {
    render(<SaleList />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

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

  it("Given: loading state When: rendering Then: should show title but no sale data", () => {
    mockQueryState = { data: undefined, isLoading: true, isError: false };
    render(<SaleList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("SALE-001")).not.toBeInTheDocument();
  });

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
});
