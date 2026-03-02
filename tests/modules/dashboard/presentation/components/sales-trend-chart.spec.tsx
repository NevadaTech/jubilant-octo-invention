import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SalesTrendChart } from "@/modules/dashboard/presentation/components/sales-trend-chart";

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
  AreaChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="area-chart">{children}</div>
  ),
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
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
  formatCurrency: (v: number, currency: string, locale: string) =>
    `${currency}${v}`,
  formatCompactCurrency: (v: number, currency: string, locale: string) =>
    `${currency}${v}`,
}));

// --- Helpers ---

function makeTrendData() {
  return [
    { date: "2026-02-25", count: 5, revenue: 1500 },
    { date: "2026-02-26", count: 8, revenue: 2400 },
    { date: "2026-02-27", count: 3, revenue: 900 },
  ];
}

// --- Tests ---

describe("SalesTrendChart", () => {
  it("Given: trend data with entries When: rendering Then: should display the chart title and description", () => {
    // Arrange & Act
    render(<SalesTrendChart data={makeTrendData()} currency="USD" />);

    // Assert
    expect(screen.getByText("salesTrend.title")).toBeDefined();
    expect(screen.getByText("salesTrend.description")).toBeDefined();
  });

  it("Given: trend data with entries When: rendering Then: should render the AreaChart inside a ResponsiveContainer", () => {
    // Arrange & Act
    render(<SalesTrendChart data={makeTrendData()} currency="USD" />);

    // Assert
    expect(screen.getByTestId("chart-container")).toBeDefined();
    expect(screen.getByTestId("area-chart")).toBeDefined();
  });

  it("Given: empty data array When: rendering Then: should display the noData message instead of the chart", () => {
    // Arrange & Act
    render(<SalesTrendChart data={[]} currency="USD" />);

    // Assert
    expect(screen.getByText("noData")).toBeDefined();
    expect(screen.queryByTestId("area-chart")).toBeNull();
    expect(screen.queryByTestId("chart-container")).toBeNull();
  });

  it("Given: data with entries When: rendering Then: should render card structure with header and content", () => {
    // Arrange & Act
    render(<SalesTrendChart data={makeTrendData()} currency="USD" />);

    // Assert
    expect(screen.getByTestId("card")).toBeDefined();
    expect(screen.getByTestId("card-header")).toBeDefined();
    expect(screen.getByTestId("card-content")).toBeDefined();
  });

  it("Given: empty data When: rendering Then: should still render card structure", () => {
    // Arrange & Act
    render(<SalesTrendChart data={[]} currency="EUR" />);

    // Assert
    expect(screen.getByTestId("card")).toBeDefined();
    expect(screen.getByTestId("card-title")).toBeDefined();
    expect(screen.getByText("salesTrend.title")).toBeDefined();
  });
});
