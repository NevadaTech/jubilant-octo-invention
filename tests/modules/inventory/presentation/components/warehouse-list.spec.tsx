import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { WarehouseList } from "@/modules/inventory/presentation/components/warehouses/warehouse-list";

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
  "@/modules/inventory/presentation/components/warehouses/warehouse-filters",
  () => ({
    WarehouseFiltersComponent: () => <div data-testid="warehouse-filters" />,
  }),
);

const mockData = {
  data: [
    {
      id: "wh-1",
      code: "WH-001",
      name: "Main Warehouse",
      address: "123 Main St",
      isActive: true,
    },
    {
      id: "wh-2",
      code: "WH-002",
      name: "Secondary Warehouse",
      address: null,
      isActive: false,
    },
  ],
  pagination: { page: 1, totalPages: 1, total: 2, limit: 10 },
};

let mockQueryState: {
  data: typeof mockData | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
} = {
  data: mockData,
  isLoading: false,
  isError: false,
  error: null,
};

vi.mock("@/modules/inventory/presentation/hooks", () => ({
  useWarehouses: () => mockQueryState,
  useWarehouseFilters: () => ({ page: 1, limit: 10 }),
  useSetWarehouseFilters: () => vi.fn(),
}));

describe("WarehouseList", () => {
  beforeEach(() => {
    mockQueryState = {
      data: mockData,
      isLoading: false,
      isError: false,
      error: null,
    };
  });

  it("Given: warehouse data When: rendering Then: should show list title", () => {
    render(<WarehouseList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
  });

  it("Given: warehouse data When: rendering Then: should show warehouse names", () => {
    render(<WarehouseList />);
    expect(screen.getByText("Main Warehouse")).toBeInTheDocument();
    expect(screen.getByText("Secondary Warehouse")).toBeInTheDocument();
  });

  it("Given: warehouse data When: rendering Then: should show warehouse codes", () => {
    render(<WarehouseList />);
    expect(screen.getByText("WH-001")).toBeInTheDocument();
    expect(screen.getByText("WH-002")).toBeInTheDocument();
  });

  it("Given: warehouse with address When: rendering Then: should show address", () => {
    render(<WarehouseList />);
    expect(screen.getByText("123 Main St")).toBeInTheDocument();
  });

  it("Given: warehouse without address When: rendering Then: should show N/A", () => {
    render(<WarehouseList />);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("Given: warehouse data When: rendering Then: should show new warehouse button", () => {
    render(<WarehouseList />);
    expect(screen.getByText("actions.new")).toBeInTheDocument();
  });

  it("Given: warehouse data When: rendering Then: should render warehouse filters child", () => {
    render(<WarehouseList />);
    expect(screen.getByTestId("warehouse-filters")).toBeInTheDocument();
  });

  it("Given: active warehouse When: rendering Then: should show active status badge", () => {
    render(<WarehouseList />);
    expect(screen.getByText("status.active")).toBeInTheDocument();
  });

  it("Given: inactive warehouse When: rendering Then: should show inactive status badge", () => {
    render(<WarehouseList />);
    expect(screen.getByText("status.inactive")).toBeInTheDocument();
  });

  it("Given: empty warehouses When: rendering Then: should show empty state", () => {
    mockQueryState = {
      data: {
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0, limit: 10 },
      },
      isLoading: false,
      isError: false,
      error: null,
    };
    render(<WarehouseList />);
    expect(screen.getByText("empty.title")).toBeInTheDocument();
    expect(screen.getByText("empty.description")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should show title but no warehouse data", () => {
    mockQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };
    render(<WarehouseList />);
    expect(screen.getByText("list.title")).toBeInTheDocument();
    expect(screen.queryByText("Main Warehouse")).not.toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should show error message", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network error"),
    };
    render(<WarehouseList />);
    expect(screen.getByText(/error\.loading/)).toBeInTheDocument();
  });

  it("Given: error state When: rendering Then: should not show title or table", () => {
    mockQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Failed"),
    };
    render(<WarehouseList />);
    expect(screen.queryByText("list.title")).not.toBeInTheDocument();
    expect(screen.queryByText("actions.new")).not.toBeInTheDocument();
  });
});
