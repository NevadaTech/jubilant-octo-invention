import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { StockDistributionChart } from "@/modules/dashboard/presentation/components/stock-distribution-chart";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
  useLocale: () => "en-US",
}));

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chart-container">{children}</div>
  ),
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie">{children}</div>
  ),
  Cell: () => null,
  Tooltip: () => null,
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
}));

vi.mock("@/lib/number", () => ({
  formatCurrency: (v: number, currency: string) => `${currency}${v}`,
  formatNumber: (v: number) => String(v),
}));

// --- Helpers ---

function makeStockData() {
  return [
    { warehouseName: "Main Warehouse", quantity: 500, value: 25000 },
    { warehouseName: "Secondary Depot", quantity: 300, value: 15000 },
    { warehouseName: "Outlet Store", quantity: 200, value: 10000 },
  ];
}

// --- Tests ---

describe("StockDistributionChart", () => {
  it("Given: stock data When: rendering Then: should display the chart title and description", () => {
    // Arrange & Act
    render(<StockDistributionChart data={makeStockData()} currency="USD" />);

    // Assert
    expect(screen.getByText("stockDistribution.title")).toBeDefined();
    expect(screen.getByText("stockDistribution.description")).toBeDefined();
  });

  it("Given: stock data When: rendering Then: should render the PieChart inside a ResponsiveContainer", () => {
    // Arrange & Act
    render(<StockDistributionChart data={makeStockData()} currency="USD" />);

    // Assert
    expect(screen.getByTestId("chart-container")).toBeDefined();
    expect(screen.getByTestId("pie-chart")).toBeDefined();
  });

  it("Given: empty data array When: rendering Then: should display the noData message instead of the chart", () => {
    // Arrange & Act
    render(<StockDistributionChart data={[]} currency="USD" />);

    // Assert
    expect(screen.getByText("noData")).toBeDefined();
    expect(screen.queryByTestId("pie-chart")).toBeNull();
    expect(screen.queryByTestId("chart-container")).toBeNull();
  });

  it("Given: stock data When: rendering Then: should display warehouse names in the legend", () => {
    // Arrange & Act
    render(<StockDistributionChart data={makeStockData()} currency="USD" />);

    // Assert
    expect(screen.getByText("Main Warehouse")).toBeDefined();
    expect(screen.getByText("Secondary Depot")).toBeDefined();
    expect(screen.getByText("Outlet Store")).toBeDefined();
  });

  it("Given: stock data When: rendering Then: should display percentage for each warehouse", () => {
    // Arrange & Act
    const data = makeStockData();
    // total value = 25000 + 15000 + 10000 = 50000
    // Main = 50%, Secondary = 30%, Outlet = 20%
    render(<StockDistributionChart data={data} currency="USD" />);

    // Assert
    expect(screen.getByText("50%")).toBeDefined();
    expect(screen.getByText("30%")).toBeDefined();
    expect(screen.getByText("20%")).toBeDefined();
  });

  it("Given: single warehouse data When: rendering Then: should display 100% for the only warehouse", () => {
    // Arrange
    const data = [
      { warehouseName: "Only Warehouse", quantity: 100, value: 5000 },
    ];

    // Act
    render(<StockDistributionChart data={data} currency="EUR" />);

    // Assert
    expect(screen.getByText("Only Warehouse")).toBeDefined();
    expect(screen.getByText("100%")).toBeDefined();
  });
});
