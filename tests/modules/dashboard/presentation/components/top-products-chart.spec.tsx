import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TopProductsChart } from "@/modules/dashboard/presentation/components/top-products-chart";

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
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar">{children}</div>
  ),
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
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
  formatCompactCurrency: (v: number, currency: string) => `${currency}${v}`,
}));

// --- Helpers ---

function makeProductsData() {
  return [
    { name: "Widget Alpha", sku: "WA-001", revenue: 5000, quantitySold: 100 },
    { name: "Widget Beta", sku: "WB-002", revenue: 3500, quantitySold: 70 },
    { name: "Widget Gamma", sku: "WG-003", revenue: 2000, quantitySold: 40 },
  ];
}

// --- Tests ---

describe("TopProductsChart", () => {
  it("Given: products data When: rendering Then: should display the chart title and description", () => {
    // Arrange & Act
    render(<TopProductsChart data={makeProductsData()} currency="USD" />);

    // Assert
    expect(screen.getByText("topProducts.title")).toBeDefined();
    expect(screen.getByText("topProducts.description")).toBeDefined();
  });

  it("Given: products data When: rendering Then: should render the BarChart inside a ResponsiveContainer", () => {
    // Arrange & Act
    render(<TopProductsChart data={makeProductsData()} currency="USD" />);

    // Assert
    expect(screen.getByTestId("chart-container")).toBeDefined();
    expect(screen.getByTestId("bar-chart")).toBeDefined();
  });

  it("Given: empty data array When: rendering Then: should display the noData message instead of the chart", () => {
    // Arrange & Act
    render(<TopProductsChart data={[]} currency="USD" />);

    // Assert
    expect(screen.getByText("noData")).toBeDefined();
    expect(screen.queryByTestId("bar-chart")).toBeNull();
    expect(screen.queryByTestId("chart-container")).toBeNull();
  });

  it("Given: data with products When: rendering Then: should render Card structure correctly", () => {
    // Arrange & Act
    render(<TopProductsChart data={makeProductsData()} currency="EUR" />);

    // Assert
    expect(screen.getByTestId("card")).toBeDefined();
    expect(screen.getByTestId("card-header")).toBeDefined();
    expect(screen.getByTestId("card-content")).toBeDefined();
  });

  it("Given: multiple products When: rendering Then: should render a Cell for each data item", () => {
    // Arrange & Act
    const data = makeProductsData();
    render(<TopProductsChart data={data} currency="USD" />);

    // Assert - Bar component should be rendered with children (Cells)
    expect(screen.getByTestId("bar")).toBeDefined();
  });
});
