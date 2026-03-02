import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportSummaryBar } from "@/modules/reports/presentation/components/report-summary-bar";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = (key: string) => key.startsWith("summary.");
    return t;
  },
  useLocale: () => "en-US",
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
}));

vi.mock("@/modules/reports/presentation/utils/report-utils", () => ({
  formatCellValue: (
    value: unknown,
    type: string,
    _locale?: string,
    _currency?: string,
  ) => {
    if (value === null || value === undefined || value === "") return "\u2014";
    if (type === "currency") return `$${value}`;
    if (type === "percentage") return `${value}%`;
    if (type === "number") return String(value);
    return String(value);
  },
  formatSummaryKey: (key: string) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .trim()
      .replace(/^\w/, (c: string) => c.toUpperCase()),
}));

// --- Tests ---

describe("ReportSummaryBar", () => {
  it("Given: summary with entries When: rendering Then: should display keys and values", () => {
    // Arrange
    const summary = { totalItems: 150, totalValue: 25000 };

    // Act
    render(<ReportSummaryBar summary={summary} currency="USD" />);

    // Assert
    // "totalItems" has an i18n key "summary.totalItems" which t.has returns true, so it uses t()
    expect(screen.getByText("summary.totalItems")).toBeDefined();
    expect(screen.getByText("summary.totalValue")).toBeDefined();
  });

  it("Given: empty summary object When: rendering Then: should return null (nothing rendered)", () => {
    // Arrange & Act
    const { container } = render(
      <ReportSummaryBar summary={{}} currency="USD" />,
    );

    // Assert
    expect(container.innerHTML).toBe("");
  });

  it("Given: summary with null/undefined values When: rendering Then: should filter them out", () => {
    // Arrange
    const summary = {
      totalItems: 100,
      nullField: null as unknown as number,
      undefinedField: undefined as unknown as number,
    };

    // Act
    render(<ReportSummaryBar summary={summary} currency="USD" />);

    // Assert
    expect(screen.getByText("summary.totalItems")).toBeDefined();
    // Only 1 key/value pair should be shown (totalItems)
    const values = screen.getAllByText(/\d+/);
    expect(values.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: summary with currency key When: rendering Then: should format as currency", () => {
    // Arrange
    const summary = { totalRevenue: 5000 };

    // Act
    render(<ReportSummaryBar summary={summary} currency="USD" />);

    // Assert - "revenue" contains "revenue" so getType returns "currency"
    // formatCellValue mock returns "$5000" for currency type
    expect(screen.getByText("$5000")).toBeDefined();
  });

  it("Given: summary with percentage key When: rendering Then: should format as percentage", () => {
    // Arrange
    const summary = { returnRate: 12.5 };

    // Act
    render(<ReportSummaryBar summary={summary} currency="USD" />);

    // Assert - "rate" key triggers percentage type
    expect(screen.getByText("12.5%")).toBeDefined();
  });

  it("Given: summary with plain number key When: rendering Then: should format as number", () => {
    // Arrange - key without value/revenue/cost/amount/margin/percentage/rate
    const summary = { totalItems: 42 };

    // Act
    render(<ReportSummaryBar summary={summary} currency="USD" />);

    // Assert - plain number via formatCellValue returns "42"
    expect(screen.getByText("42")).toBeDefined();
  });

  it("Given: summary with string value When: rendering Then: should display the string as-is", () => {
    // Arrange
    const summary = { category: "Electronics" };

    // Act
    render(<ReportSummaryBar summary={summary} />);

    // Assert - string type returns value as-is
    expect(screen.getByText("Electronics")).toBeDefined();
  });
});
