import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportViewer } from "@/modules/reports/presentation/components/report-viewer";
import type { ReportResult } from "@/modules/reports/application/dto/report.dto";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = () => true;
    return t;
  },
  useLocale: () => "en-US",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    disabled,
    variant,
    asChild,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    variant?: string;
    asChild?: boolean;
  }) => {
    if (asChild) return <>{children}</>;
    return (
      <button onClick={onClick} disabled={disabled} data-variant={variant}>
        {children}
      </button>
    );
  },
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

vi.mock("@/ui/components/skeleton", () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}));

vi.mock(
  "@/modules/reports/presentation/components/report-filters-form",
  () => ({
    ReportFiltersForm: () => <div data-testid="report-filters-form" />,
  }),
);

vi.mock("@/modules/reports/presentation/components/report-table", () => ({
  ReportTable: () => <div data-testid="report-table" />,
}));

vi.mock(
  "@/modules/reports/presentation/components/report-summary-bar",
  () => ({
    ReportSummaryBar: () => <div data-testid="report-summary-bar" />,
  }),
);

vi.mock(
  "@/modules/reports/presentation/components/report-export-button",
  () => ({
    ReportExportButton: () => (
      <button data-testid="report-export-button">Export</button>
    ),
  }),
);

vi.mock(
  "@/modules/reports/presentation/utils/report-utils",
  () => ({
    getCategoryForReportType: () => "inventory",
  }),
);

let mockReportQueryState: {
  data: ReportResult | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
} = {
  data: undefined,
  isLoading: false,
  isError: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("@/modules/reports/presentation/hooks/use-reports", () => ({
  useReportView: () => mockReportQueryState,
}));

// --- Helpers ---

function makeReportResult(
  overrides: Partial<ReportResult> = {},
): ReportResult {
  return {
    columns: overrides.columns ?? [
      { key: "name", header: "Name", type: "string" },
      { key: "quantity", header: "Quantity", type: "number" },
    ],
    rows: overrides.rows ?? [
      { name: "Product A", quantity: 100 },
      { name: "Product B", quantity: 50 },
    ],
    metadata: overrides.metadata ?? {
      reportType: "AVAILABLE_INVENTORY",
      reportTitle: "Available Inventory",
      generatedAt: "2026-02-15T10:00:00Z",
      totalRecords: 2,
    },
    summary: overrides.summary,
    fromCache: overrides.fromCache,
  };
}

// --- Tests ---

describe("ReportViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockReportQueryState = {
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  it("Given: initial state When: rendering Then: should display title and description", () => {
    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    expect(screen.getByText("Available Inventory")).toBeDefined();
    expect(screen.getByText("View current stock levels")).toBeDefined();
  });

  it("Given: data is loading When: rendering Then: should display skeleton placeholders", () => {
    mockReportQueryState = {
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    const skeletons = screen.getAllByTestId("skeleton");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("Given: error occurred When: rendering Then: should display error message with retry button", () => {
    mockReportQueryState = {
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error("Network failure"),
      refetch: vi.fn(),
    };

    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    expect(screen.getByText("errors.loadFailed")).toBeDefined();
    expect(screen.getByText("Network failure")).toBeDefined();
    expect(screen.getByText("tryAgain")).toBeDefined();
  });

  it("Given: report data loaded When: rendering Then: should display the report table and record count", () => {
    const report = makeReportResult();
    mockReportQueryState = {
      data: report,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    expect(screen.getByTestId("report-table")).toBeDefined();
    expect(screen.getByTestId("report-filters-form")).toBeDefined();
  });

  it("Given: report data with fromCache flag When: rendering Then: should display cache badge", () => {
    const report = makeReportResult({ fromCache: true });
    mockReportQueryState = {
      data: report,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    expect(screen.getByText("fromCache")).toBeDefined();
  });

  it("Given: report data with summary When: rendering Then: should display the summary bar", () => {
    const report = makeReportResult({
      summary: { totalValue: 5000, avgCost: 25 },
    });
    mockReportQueryState = {
      data: report,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    };

    render(
      <ReportViewer
        type="AVAILABLE_INVENTORY"
        title="Available Inventory"
        description="View current stock levels"
      />,
    );

    expect(screen.getByTestId("report-summary-bar")).toBeDefined();
  });
});
