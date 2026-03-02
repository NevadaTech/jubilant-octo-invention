import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportTable } from "@/modules/reports/presentation/components/report-table";
import type { ReportColumn } from "@/modules/reports/application/dto/report.dto";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = (key: string) => key.startsWith("columnHeaders.") || key.startsWith("badgeLabels.");
    return t;
  },
}));

vi.mock("@/ui/components/table", () => ({
  Table: ({ children }: { children: React.ReactNode }) => (
    <table data-testid="table">{children}</table>
  ),
  TableBody: ({ children }: { children: React.ReactNode }) => (
    <tbody data-testid="table-body">{children}</tbody>
  ),
  TableCell: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <td className={className}>{children}</td>,
  TableHead: ({
    children,
    className,
    onClick,
    style,
  }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    style?: React.CSSProperties;
  }) => (
    <th className={className} onClick={onClick} style={style}>
      {children}
    </th>
  ),
  TableHeader: ({ children }: { children: React.ReactNode }) => (
    <thead data-testid="table-header">{children}</thead>
  ),
  TableRow: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => <tr className={className}>{children}</tr>,
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

vi.mock("@/ui/lib/utils", () => ({
  cn: (...args: unknown[]) => args.filter(Boolean).join(" "),
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
    if (type === "number") return String(value);
    if (type === "percentage") return `${value}%`;
    return String(value);
  },
}));

// --- Helpers ---

function makeColumns(): ReportColumn[] {
  return [
    { key: "name", header: "Name", type: "string" },
    { key: "quantity", header: "Quantity", type: "number" },
    { key: "value", header: "Value", type: "currency" },
  ];
}

function makeRows(): Record<string, unknown>[] {
  return [
    { name: "Widget A", quantity: 100, value: 1500 },
    { name: "Widget B", quantity: 50, value: 750 },
    { name: "Widget C", quantity: 200, value: 3000 },
  ];
}

// --- Tests ---

describe("ReportTable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: no rows When: rendering Then: should display empty state message", () => {
    render(<ReportTable columns={makeColumns()} rows={[]} />);

    expect(screen.getByText("noRecordsFound")).toBeDefined();
    expect(screen.queryByTestId("table")).toBeNull();
  });

  it("Given: columns and rows When: rendering Then: should render table with column headers", () => {
    render(<ReportTable columns={makeColumns()} rows={makeRows()} />);

    expect(screen.getByTestId("table")).toBeDefined();
    expect(screen.getByTestId("table-header")).toBeDefined();
    // Column headers go through translateHeader => t("columnHeaders.Name") which returns "columnHeaders.Name"
    expect(screen.getByText("columnHeaders.Name")).toBeDefined();
    expect(screen.getByText("columnHeaders.Quantity")).toBeDefined();
    expect(screen.getByText("columnHeaders.Value")).toBeDefined();
  });

  it("Given: rows with data When: rendering Then: should render data cells for each row", () => {
    render(
      <ReportTable
        columns={makeColumns()}
        rows={makeRows()}
        locale="en-US"
      />,
    );

    expect(screen.getByText("Widget A")).toBeDefined();
    expect(screen.getByText("Widget B")).toBeDefined();
    expect(screen.getByText("Widget C")).toBeDefined();
  });

  it("Given: a column with status key When: rendering a row with status value Then: should render a badge", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string" },
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ name: "Item 1", status: "ACTIVE" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badges = screen.getAllByTestId("badge");
    // labelFor runs t("badgeLabels.ACTIVE") which returns "badgeLabels.ACTIVE"
    const statusBadge = badges.find((b) => b.textContent === "badgeLabels.ACTIVE");
    expect(statusBadge).toBeDefined();
    expect(statusBadge?.getAttribute("data-variant")).toBe("success");
  });

  it("Given: a boolean column When: rendering Then: should render yes/no badge", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string" },
      { key: "isActive", header: "Active", type: "boolean" },
    ];
    const rows = [
      { name: "Item 1", isActive: true },
      { name: "Item 2", isActive: false },
    ];

    render(<ReportTable columns={columns} rows={rows} />);

    const badges = screen.getAllByTestId("badge");
    const yesBadge = badges.find((b) => b.textContent === "boolean.yes");
    const noBadge = badges.find((b) => b.textContent === "boolean.no");
    expect(yesBadge).toBeDefined();
    expect(noBadge).toBeDefined();
    expect(yesBadge?.getAttribute("data-variant")).toBe("success");
    expect(noBadge?.getAttribute("data-variant")).toBe("secondary");
  });

  it("Given: a sortable column When: clicking the header Then: should sort ascending then descending", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", sortable: true },
      { key: "quantity", header: "Qty", type: "number", sortable: true },
    ];
    const rows = [
      { name: "Bravo", quantity: 50 },
      { name: "Alpha", quantity: 100 },
      { name: "Charlie", quantity: 25 },
    ];

    const { container } = render(
      <ReportTable columns={columns} rows={rows} locale="en-US" />,
    );

    // Click the "Name" column header to sort ascending
    const nameHeader = screen.getByText("columnHeaders.Name").closest("th");
    fireEvent.click(nameHeader!);

    // After ascending sort: Alpha, Bravo, Charlie
    const firstRowCells = container.querySelectorAll("tbody tr:first-child td");
    expect(firstRowCells[0].textContent).toBe("Alpha");

    // Click again to sort descending
    fireEvent.click(nameHeader!);

    const firstRowCellsDesc = container.querySelectorAll(
      "tbody tr:first-child td",
    );
    expect(firstRowCellsDesc[0].textContent).toBe("Charlie");
  });
});
