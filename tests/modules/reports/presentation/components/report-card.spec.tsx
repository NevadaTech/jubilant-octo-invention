import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportCard } from "@/modules/reports/presentation/components/report-card";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => (
    <a data-testid="link" href={href}>
      {children}
    </a>
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

vi.mock("@/ui/components/badge", () => ({
  Badge: ({
    children,
    variant,
    className,
  }: {
    children: React.ReactNode;
    variant?: string;
    className?: string;
  }) => (
    <span data-testid="badge" data-variant={variant} className={className}>
      {children}
    </span>
  ),
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    asChild,
    ...props
  }: {
    children: React.ReactNode;
    asChild?: boolean;
    [key: string]: unknown;
  }) => <div data-testid="button">{children}</div>,
}));

vi.mock("@/ui/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
}));

vi.mock("@/modules/reports/presentation/utils/report-utils", () => ({
  reportTypeToSlug: (type: string) => type.toLowerCase().replace(/_/g, "-"),
}));

vi.mock("lucide-react", () => {
  const Icon = ({ className }: { className?: string }) => (
    <svg data-testid="report-icon" className={className} />
  );
  return {
    Package: Icon,
    History: Icon,
    Calculator: Icon,
    AlertTriangle: Icon,
    ArrowUpDown: Icon,
    DollarSign: Icon,
    RotateCcw: Icon,
    ShoppingCart: Icon,
    BarChart3: Icon,
    Building2: Icon,
    PackageX: Icon,
    Layers: Icon,
    User: Icon,
    Truck: Icon,
    TrendingUp: Icon,
    Archive: Icon,
  };
});

// --- Tests ---

describe("ReportCard", () => {
  it("Given: report type and title When: rendering Then: should display the title and description", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
        category="inventory"
        locale="en"
      />,
    );

    // Assert
    expect(screen.getByText("Available Inventory")).toBeDefined();
    expect(screen.getByText("View current stock levels")).toBeDefined();
  });

  it("Given: report card When: rendering Then: should display a category badge", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="SALES"
        title="Sales Report"
        description="Sales overview"
        category="sales"
        locale="en"
      />,
    );

    // Assert
    const badge = screen.getByTestId("badge");
    expect(badge.textContent).toBe("categories.sales");
  });

  it("Given: report card When: rendering Then: should display a link with the correct href", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="LOW_STOCK"
        title="Low Stock"
        description="Items below reorder point"
        category="inventory"
        locale="en"
      />,
    );

    // Assert
    const link = screen.getByTestId("link");
    expect(link.getAttribute("href")).toBe("/en/dashboard/reports/low-stock");
  });

  it("Given: report card When: rendering Then: should display the viewReport button text", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="RETURNS"
        title="Returns"
        description="Returns report"
        category="returns"
        locale="es"
      />,
    );

    // Assert
    expect(screen.getByText("viewReport")).toBeDefined();
  });

  it("Given: LOW_STOCK type (alert type) When: rendering Then: should apply alert border styling", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="LOW_STOCK"
        title="Low Stock Alert"
        description="Critical stock levels"
        category="inventory"
        locale="en"
      />,
    );

    // Assert - Card className should contain the orange border for alert types
    const card = screen.getByTestId("card");
    expect(card.className).toContain("border-orange-200");
  });

  it("Given: non-alert type When: rendering Then: should not apply alert border styling", () => {
    // Arrange & Act
    render(
      <ReportCard
        type="VALUATION"
        title="Valuation"
        description="Stock valuation"
        category="inventory"
        locale="en"
      />,
    );

    // Assert
    const card = screen.getByTestId("card");
    expect(card.className).not.toContain("border-orange-200");
  });
});
