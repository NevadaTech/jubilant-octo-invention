import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WarehouseDetail } from "@/modules/inventory/presentation/components/warehouses/warehouse-detail";
import { Warehouse } from "@/modules/inventory/domain/entities/warehouse.entity";

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

const mockToggleMutateAsync = vi.fn();

let mockWarehouseHook: {
  data: Warehouse | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
};

let mockToggleHook: {
  mutateAsync: typeof mockToggleMutateAsync;
  isPending: boolean;
};

interface StockItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  warehouseId: string;
  quantity: number;
  averageCost: number;
  totalValue: number;
  availableQuantity: number;
  currency: string;
}

let mockStockHook: {
  data:
    | {
        data: StockItem[];
        pagination: { total: number; page: number; limit: number };
      }
    | undefined;
  isLoading: boolean;
};

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouse: () => mockWarehouseHook,
  useToggleWarehouseStatus: () => mockToggleHook,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-stock", () => ({
  useStock: () => mockStockHook,
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

vi.mock("@/ui/components/input", () => ({
  Input: (props: Record<string, unknown>) => (
    <input data-testid="search-input" {...props} />
  ),
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card" className={className}>
      {children}
    </div>
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
  CardHeader: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="card-header" className={className}>
      {children}
    </div>
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

vi.mock("@/ui/components/badge", () => ({
  Badge: ({
    children,
    variant,
  }: {
    children: React.ReactNode;
    variant?: string;
  }) => (
    <span data-testid="badge" data-variant={variant}>
      {children}
    </span>
  ),
}));

vi.mock("@/ui/components/sortable-header", () => ({
  SortableHeader: ({
    label,
    field,
    onSort,
    className,
  }: {
    label: string;
    field: string;
    currentSortBy?: string;
    currentSortOrder?: string;
    onSort: (field: string, order: "asc" | "desc" | undefined) => void;
    className?: string;
  }) => (
    <th
      data-testid={`sortable-header-${field}`}
      className={className}
      onClick={() => onSort(field, "asc")}
    >
      {label}
    </th>
  ),
}));

vi.mock("@/ui/components/alert-dialog", () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children: React.ReactNode;
    open?: boolean;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="alert-title">{children}</h2>
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
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button onClick={onClick} data-testid="alert-action">
      {children}
    </button>
  ),
}));

// --- Helpers ---

function makeWarehouse(
  overrides: Partial<{
    id: string;
    name: string;
    code: string;
    address: string | null;
    isActive: boolean;
    statusChangedBy: string | null;
    statusChangedAt: string | null;
  }> = {},
): Warehouse {
  return Warehouse.create({
    id: overrides.id ?? "wh-1",
    code: overrides.code ?? "WH-001",
    name: overrides.name ?? "Central Warehouse",
    address: overrides.address ?? "123 Main St",
    isActive: overrides.isActive ?? true,
    createdAt: new Date("2026-01-10"),
    updatedAt: new Date("2026-02-20"),
    statusChangedBy: overrides.statusChangedBy ?? null,
    statusChangedAt: overrides.statusChangedAt ?? null,
  });
}

function makeStockData(items: StockItem[] = []) {
  return {
    data: items,
    pagination: { total: items.length, page: 1, limit: 100 },
  };
}

// --- Tests ---

describe("WarehouseDetail", () => {
  beforeEach(() => {
    mockToggleMutateAsync.mockClear();
    mockWarehouseHook = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
    };
    mockToggleHook = {
      mutateAsync: mockToggleMutateAsync,
      isPending: false,
    };
    mockStockHook = {
      data: makeStockData(),
      isLoading: false,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholder", () => {
    // Arrange
    mockWarehouseHook = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    const cardContent = screen.getByTestId("card-content");
    const pulsingElements = cardContent.querySelectorAll(".animate-pulse");
    expect(pulsingElements.length).toBeGreaterThan(0);
  });

  it("Given: error state When: rendering Then: should display error message and back link", () => {
    // Arrange
    mockWarehouseHook = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Warehouse not found"),
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("Warehouse not found")).toBeDefined();
    expect(screen.getByText("detail.backToList")).toBeDefined();
  });

  it("Given: active warehouse loaded When: rendering Then: should display name, code, address, and active badge", () => {
    // Arrange
    const warehouse = makeWarehouse({
      name: "East Distribution Center",
      code: "EDC-01",
      address: "456 Commerce Ave",
      isActive: true,
    });
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("East Distribution Center")).toBeDefined();
    expect(screen.getByText("EDC-01")).toBeDefined();
    expect(screen.getByText("456 Commerce Ave")).toBeDefined();
    const badges = screen.getAllByTestId("badge");
    const activeBadge = badges.find((b) => b.textContent === "status.active");
    expect(activeBadge).toBeDefined();
    expect(activeBadge?.getAttribute("data-variant")).toBe("success");
  });

  it("Given: inactive warehouse with statusChangedBy When: rendering Then: should show status info card", () => {
    // Arrange
    const warehouse = makeWarehouse({
      isActive: false,
      statusChangedBy: "Admin User",
      statusChangedAt: "2026-02-15T09:00:00Z",
    });
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("detail.statusInfo")).toBeDefined();
    expect(screen.getByText("Admin User")).toBeDefined();
    expect(screen.getByText("detail.statusChangedBy")).toBeDefined();
  });

  it("Given: warehouse with stock data When: rendering Then: should display stock table with product names and quantities", () => {
    // Arrange
    const warehouse = makeWarehouse();
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };
    mockStockHook = {
      data: makeStockData([
        {
          id: "s-1",
          productId: "p-1",
          productName: "Widget A",
          productSku: "WA-01",
          warehouseId: "wh-1",
          quantity: 100,
          averageCost: 25,
          totalValue: 2500,
          availableQuantity: 80,
          currency: "USD",
        },
        {
          id: "s-2",
          productId: "p-2",
          productName: "Widget B",
          productSku: "WB-02",
          warehouseId: "wh-1",
          quantity: 50,
          averageCost: 40,
          totalValue: 2000,
          availableQuantity: 50,
          currency: "USD",
        },
      ]),
      isLoading: false,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("Widget A")).toBeDefined();
    expect(screen.getByText("WA-01")).toBeDefined();
    expect(screen.getByText("Widget B")).toBeDefined();
    expect(screen.getByText("WB-02")).toBeDefined();
  });

  it("Given: warehouse with no products When: rendering Then: should display empty state message", () => {
    // Arrange
    const warehouse = makeWarehouse();
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };
    mockStockHook = {
      data: makeStockData([]),
      isLoading: false,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("detail.noProducts")).toBeDefined();
  });

  it("Given: active warehouse When: clicking toggle button Then: should open confirmation dialog", () => {
    // Arrange
    const warehouse = makeWarehouse({ isActive: true });
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);
    const toggleBtn = screen.getByText("actions.deactivate");
    fireEvent.click(toggleBtn);

    // Assert
    expect(screen.getByTestId("alert-dialog")).toBeDefined();
    expect(screen.getByText("confirm.deactivate.title")).toBeDefined();
    expect(screen.getByText("confirm.deactivate.description")).toBeDefined();
  });

  it("Given: warehouse with stock data When: rendering stats card Then: should display total products and total value", () => {
    // Arrange
    const warehouse = makeWarehouse();
    mockWarehouseHook = {
      data: warehouse,
      isLoading: false,
      isError: false,
      error: null,
    };
    mockStockHook = {
      data: makeStockData([
        {
          id: "s-1",
          productId: "p-1",
          productName: "X",
          productSku: "X-1",
          warehouseId: "wh-1",
          quantity: 200,
          averageCost: 10,
          totalValue: 2000,
          availableQuantity: 200,
          currency: "USD",
        },
      ]),
      isLoading: false,
    };

    // Act
    render(<WarehouseDetail warehouseId="wh-1" />);

    // Assert
    expect(screen.getByText("detail.stats")).toBeDefined();
    expect(screen.getByText("detail.totalProducts")).toBeDefined();
    expect(screen.getByText("detail.totalQuantity")).toBeDefined();
    expect(screen.getByText("detail.totalValue")).toBeDefined();
  });
});
