import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardMetricsGrid } from "@/modules/dashboard/presentation/components/dashboard-metrics-grid";
import type { DashboardMetricsDto } from "@/modules/dashboard/application/dto/metrics.dto";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
  useLocale: () => "en",
}));

vi.mock("@/modules/dashboard/presentation/components/stat-card", () => ({
  StatCard: ({
    title,
    value,
    description,
    color,
  }: {
    title: string;
    value: string | number;
    description?: string;
    icon: unknown;
    color?: string;
  }) => (
    <div data-testid="stat-card" data-color={color}>
      <span data-testid="stat-title">{title}</span>
      <span data-testid="stat-value">{value}</span>
      {description && <span data-testid="stat-description">{description}</span>}
    </div>
  ),
}));

vi.mock("@/lib/number", () => ({
  formatCurrency: (amount: number, currency: string, locale: string) =>
    `${currency} ${amount.toFixed(2)}`,
  formatNumber: (num: number, locale: string) => String(num),
}));

// --- Helpers ---

function makeMetrics(
  overrides: Partial<DashboardMetricsDto> = {},
): DashboardMetricsDto {
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
    salesTrend: [],
    topProducts: [],
    stockByWarehouse: [],
    recentActivity: [],
    ...overrides,
  };
}

// --- Tests ---

describe("DashboardMetricsGrid", () => {
  it("Given: metrics with standard values When: rendering Then: should render 4 stat cards", () => {
    // Arrange
    const metrics = makeMetrics();

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert
    const cards = screen.getAllByTestId("stat-card");
    expect(cards.length).toBe(4);
  });

  it("Given: metrics data When: rendering Then: should display total products card with formatted value", () => {
    // Arrange
    const metrics = makeMetrics({
      inventory: {
        totalProducts: 250,
        totalStockQuantity: 8000,
        totalInventoryValue: 400000,
        currency: "USD",
      },
    });

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert — totalProducts title and value
    const titles = screen.getAllByTestId("stat-title");
    expect(titles[0].textContent).toBe("totalProducts.title");
    const values = screen.getAllByTestId("stat-value");
    expect(values[0].textContent).toBe("250");
  });

  it("Given: metrics data When: rendering Then: should display inventory value card with formatted currency", () => {
    // Arrange
    const metrics = makeMetrics({
      inventory: {
        totalProducts: 150,
        totalStockQuantity: 5000,
        totalInventoryValue: 250000,
        currency: "EUR",
      },
    });

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert — inventoryValue card shows formatted currency
    const values = screen.getAllByTestId("stat-value");
    expect(values[1].textContent).toBe("EUR 250000.00");
  });

  it("Given: lowStock count is greater than 0 When: rendering Then: should display low stock card with error color and alert description", () => {
    // Arrange
    const metrics = makeMetrics({ lowStock: { count: 12 } });

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert — third card is lowStock with error color
    const cards = screen.getAllByTestId("stat-card");
    expect(cards[2].getAttribute("data-color")).toBe("error");
    const descriptions = screen.getAllByTestId("stat-description");
    const lowStockDesc = descriptions.find(
      (d) => d.textContent === "lowStock.descriptionAlert",
    );
    expect(lowStockDesc).toBeDefined();
  });

  it("Given: lowStock count is 0 When: rendering Then: should display low stock card with success color and ok description", () => {
    // Arrange
    const metrics = makeMetrics({ lowStock: { count: 0 } });

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert — third card is lowStock with success color
    const cards = screen.getAllByTestId("stat-card");
    expect(cards[2].getAttribute("data-color")).toBe("success");
    const descriptions = screen.getAllByTestId("stat-description");
    const lowStockDesc = descriptions.find(
      (d) => d.textContent === "lowStock.descriptionOk",
    );
    expect(lowStockDesc).toBeDefined();
  });

  it("Given: metrics with sales data When: rendering Then: should display monthly sales card with currency and count", () => {
    // Arrange
    const metrics = makeMetrics({
      sales: { monthlyCount: 99, monthlyRevenue: 150000, currency: "USD" },
    });

    // Act
    render(<DashboardMetricsGrid metrics={metrics} />);

    // Assert — fourth card is monthlySales
    const titles = screen.getAllByTestId("stat-title");
    expect(titles[3].textContent).toBe("monthlySales.title");
    const values = screen.getAllByTestId("stat-value");
    expect(values[3].textContent).toBe("USD 150000.00");
  });
});
