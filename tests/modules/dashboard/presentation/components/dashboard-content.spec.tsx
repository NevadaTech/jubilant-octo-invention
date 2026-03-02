import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DashboardContent } from "@/modules/dashboard/presentation/components/dashboard-content";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

const mockRefetch = vi.fn();

let mockHookState: {
  metrics: Record<string, unknown> | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} = {
  metrics: undefined,
  isLoading: false,
  isError: false,
  refetch: mockRefetch,
};

vi.mock("@/modules/dashboard/presentation/hooks/use-dashboard-metrics", () => ({
  useDashboardMetrics: () => mockHookState,
}));

vi.mock(
  "@/modules/dashboard/presentation/components/dashboard-metrics-grid",
  () => ({
    DashboardMetricsGrid: ({ metrics }: { metrics: unknown }) => (
      <div data-testid="metrics-grid">{JSON.stringify(metrics)}</div>
    ),
  }),
);

vi.mock(
  "@/modules/dashboard/presentation/components/stat-card-skeleton",
  () => ({
    StatCardSkeleton: () => <div data-testid="stat-card-skeleton" />,
  }),
);

vi.mock("@/modules/dashboard/presentation/components/chart-skeleton", () => ({
  ChartSkeleton: () => <div data-testid="chart-skeleton" />,
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

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    ...rest
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
    size?: string;
  }) => (
    <button data-testid="retry-button" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

// Mock next/dynamic to render child components synchronously (no lazy-loading in tests)
vi.mock("next/dynamic", () => ({
  __esModule: true,
  default: (loader: () => Promise<{ default: React.ComponentType }>) => {
    // Return a placeholder component since we test chart rendering indirectly
    const DynamicComponent = (props: Record<string, unknown>) => (
      <div data-testid="dynamic-chart" {...props} />
    );
    DynamicComponent.displayName = "DynamicChart";
    return DynamicComponent;
  },
}));

// --- Helpers ---

function makeSampleMetrics() {
  return {
    inventory: {
      totalProducts: 150,
      totalStockQuantity: 5000,
      totalInventoryValue: 250000,
      currency: "USD",
    },
    lowStock: { count: 5 },
    sales: {
      monthlyCount: 42,
      monthlyRevenue: 75000,
      currency: "USD",
    },
    salesTrend: [
      { date: "2026-02-25", count: 5, revenue: 10000 },
      { date: "2026-02-26", count: 8, revenue: 16000 },
    ],
    topProducts: [
      { name: "Widget A", sku: "W-001", revenue: 20000, quantitySold: 100 },
    ],
    stockByWarehouse: [
      { warehouseName: "Main Warehouse", quantity: 3000, value: 150000 },
    ],
    recentActivity: [
      {
        type: "SALE",
        reference: "S-001",
        status: "COMPLETED",
        description: "Sale completed",
        createdAt: "2026-02-25T12:00:00Z",
      },
    ],
  };
}

// --- Tests ---

describe("DashboardContent", () => {
  beforeEach(() => {
    mockRefetch.mockClear();
    mockHookState = {
      metrics: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };
  });

  it("Given: loading state When: rendering Then: should display skeleton placeholders", () => {
    // Arrange
    mockHookState = {
      metrics: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    };

    // Act
    render(<DashboardContent />);

    // Assert — 4 stat card skeletons and 4 chart skeletons
    const statSkeletons = screen.getAllByTestId("stat-card-skeleton");
    expect(statSkeletons.length).toBe(4);

    const chartSkeletons = screen.getAllByTestId("chart-skeleton");
    expect(chartSkeletons.length).toBe(4);
  });

  it("Given: error state When: rendering Then: should display error card with retry button", () => {
    // Arrange
    mockHookState = {
      metrics: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    };

    // Act
    render(<DashboardContent />);

    // Assert
    expect(screen.getByText("error.title")).toBeDefined();
    expect(screen.getByText("error.description")).toBeDefined();
    expect(screen.getByText("error.retry")).toBeDefined();
  });

  it("Given: error state When: clicking retry button Then: should call refetch", () => {
    // Arrange
    mockHookState = {
      metrics: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    };

    // Act
    render(<DashboardContent />);
    fireEvent.click(screen.getByTestId("retry-button"));

    // Assert
    expect(mockRefetch).toHaveBeenCalledTimes(1);
  });

  it("Given: no metrics (undefined) and not loading/error When: rendering Then: should display empty state card", () => {
    // Arrange
    mockHookState = {
      metrics: undefined,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };

    // Act
    render(<DashboardContent />);

    // Assert
    expect(screen.getByText("empty.title")).toBeDefined();
    expect(screen.getByText("empty.description")).toBeDefined();
  });

  it("Given: metrics loaded successfully When: rendering Then: should display metrics grid and dynamic chart components", () => {
    // Arrange
    mockHookState = {
      metrics: makeSampleMetrics(),
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    };

    // Act
    render(<DashboardContent />);

    // Assert — DashboardMetricsGrid rendered with metrics data
    expect(screen.getByTestId("metrics-grid")).toBeDefined();

    // Dynamic chart components rendered (4 total: SalesTrend, TopProducts, StockDistribution, RecentActivity)
    const dynamicCharts = screen.getAllByTestId("dynamic-chart");
    expect(dynamicCharts.length).toBe(4);
  });
});
