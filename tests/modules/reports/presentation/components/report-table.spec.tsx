import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportTable } from "@/modules/reports/presentation/components/report-table";
import type { ReportColumn } from "@/modules/reports/application/dto/report.dto";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key;
    t.has = (key: string) =>
      key.startsWith("columnHeaders.") || key.startsWith("badgeLabels.");
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

  // --- Empty state ---

  it("Given: no rows When: rendering Then: should display empty state message", () => {
    render(<ReportTable columns={makeColumns()} rows={[]} />);
    expect(screen.getByText("noRecordsFound")).toBeInTheDocument();
    expect(screen.queryByTestId("table")).not.toBeInTheDocument();
  });

  // --- Basic rendering ---

  it("Given: columns and rows When: rendering Then: should render table with column headers", () => {
    render(<ReportTable columns={makeColumns()} rows={makeRows()} />);
    expect(screen.getByTestId("table")).toBeInTheDocument();
    expect(screen.getByText("columnHeaders.Name")).toBeInTheDocument();
    expect(screen.getByText("columnHeaders.Quantity")).toBeInTheDocument();
    expect(screen.getByText("columnHeaders.Value")).toBeInTheDocument();
  });

  it("Given: rows with data When: rendering Then: should render data cells for each row", () => {
    render(
      <ReportTable columns={makeColumns()} rows={makeRows()} locale="en-US" />,
    );
    expect(screen.getByText("Widget A")).toBeInTheDocument();
    expect(screen.getByText("Widget B")).toBeInTheDocument();
    expect(screen.getByText("Widget C")).toBeInTheDocument();
  });

  // --- Boolean column ---

  it("Given: boolean column with true value When: rendering Then: should show success badge with yes label", () => {
    const columns: ReportColumn[] = [
      { key: "isActive", header: "Active", type: "boolean" },
    ];
    const rows = [{ isActive: true }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badges = screen.getAllByTestId("badge");
    const yesBadge = badges.find((b) => b.textContent === "boolean.yes");
    expect(yesBadge).toBeDefined();
    expect(yesBadge?.getAttribute("data-variant")).toBe("success");
  });

  it("Given: boolean column with false value When: rendering Then: should show secondary badge with no label", () => {
    const columns: ReportColumn[] = [
      { key: "isActive", header: "Active", type: "boolean" },
    ];
    const rows = [{ isActive: false }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badges = screen.getAllByTestId("badge");
    const noBadge = badges.find((b) => b.textContent === "boolean.no");
    expect(noBadge).toBeDefined();
    expect(noBadge?.getAttribute("data-variant")).toBe("secondary");
  });

  // --- Status column variants ---

  it("Given: status column with CONFIRMED When: rendering Then: should show success badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "CONFIRMED" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("success");
  });

  it("Given: status column with PICKING When: rendering Then: should show warning badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "PICKING" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });

  it("Given: status column with SHIPPED When: rendering Then: should show info badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "SHIPPED" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("info");
  });

  it("Given: status column with CANCELLED When: rendering Then: should show destructive badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "CANCELLED" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
  });

  it("Given: status column with DRAFT When: rendering Then: should show secondary badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "DRAFT" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
  });

  it("Given: status column with unknown status When: rendering Then: should fallback to secondary badge", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: "UNKNOWN_STATUS" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("secondary");
  });

  it("Given: status column with null value When: rendering Then: should handle gracefully", () => {
    const columns: ReportColumn[] = [
      { key: "status", header: "Status", type: "string" },
    ];
    const rows = [{ status: null }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    // String(null ?? "") = "" → STATUS_VARIANTS[""] is undefined → fallback "secondary"
    expect(badge.getAttribute("data-variant")).toBe("secondary");
  });

  // --- Severity column ---

  it("Given: severity column with CRITICAL When: rendering Then: should show destructive badge", () => {
    const columns: ReportColumn[] = [
      { key: "severity", header: "Severity", type: "string" },
    ];
    const rows = [{ severity: "CRITICAL" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
  });

  it("Given: severity column with WARNING When: rendering Then: should show warning badge", () => {
    const columns: ReportColumn[] = [
      { key: "severity", header: "Severity", type: "string" },
    ];
    const rows = [{ severity: "WARNING" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });

  // --- Classification column ---

  it("Given: classification column with FAST_MOVING When: rendering Then: should show success badge", () => {
    const columns: ReportColumn[] = [
      { key: "classification", header: "Class", type: "string" },
    ];
    const rows = [{ classification: "FAST_MOVING" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("success");
  });

  it("Given: classification column with SLOW_MOVING When: rendering Then: should show destructive badge", () => {
    const columns: ReportColumn[] = [
      { key: "classification", header: "Class", type: "string" },
    ];
    const rows = [{ classification: "SLOW_MOVING" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
  });

  it("Given: classification column with other value When: rendering Then: should show warning badge", () => {
    const columns: ReportColumn[] = [
      { key: "classification", header: "Class", type: "string" },
    ];
    const rows = [{ classification: "NORMAL" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });

  // --- ABC Classification ---

  it("Given: abcClassification column with A When: rendering Then: should show success badge", () => {
    const columns: ReportColumn[] = [
      { key: "abcClassification", header: "ABC", type: "string" },
    ];
    const rows = [{ abcClassification: "A" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("success");
  });

  it("Given: abcClassification column with B When: rendering Then: should show warning badge", () => {
    const columns: ReportColumn[] = [
      { key: "abcClassification", header: "ABC", type: "string" },
    ];
    const rows = [{ abcClassification: "B" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });

  it("Given: abcClassification column with C When: rendering Then: should show destructive badge", () => {
    const columns: ReportColumn[] = [
      { key: "abcClassification", header: "ABC", type: "string" },
    ];
    const rows = [{ abcClassification: "C" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
  });

  // --- Risk Level ---

  it("Given: riskLevel column with HIGH When: rendering Then: should show destructive badge", () => {
    const columns: ReportColumn[] = [
      { key: "riskLevel", header: "Risk", type: "string" },
    ];
    const rows = [{ riskLevel: "HIGH" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("destructive");
  });

  it("Given: riskLevel column with MEDIUM When: rendering Then: should show warning badge", () => {
    const columns: ReportColumn[] = [
      { key: "riskLevel", header: "Risk", type: "string" },
    ];
    const rows = [{ riskLevel: "MEDIUM" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("warning");
  });

  it("Given: riskLevel column with LOW When: rendering Then: should show success badge", () => {
    const columns: ReportColumn[] = [
      { key: "riskLevel", header: "Risk", type: "string" },
    ];
    const rows = [{ riskLevel: "LOW" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("success");
  });

  // --- Type column with underscore ---

  it("Given: type column with underscore value When: rendering Then: should show outline badge", () => {
    const columns: ReportColumn[] = [
      { key: "type", header: "Type", type: "string" },
    ];
    const rows = [{ type: "ADJUST_IN" }];

    render(<ReportTable columns={columns} rows={rows} />);

    const badge = screen.getByTestId("badge");
    expect(badge.getAttribute("data-variant")).toBe("outline");
  });

  it("Given: type column without underscore When: rendering Then: should NOT render badge", () => {
    const columns: ReportColumn[] = [
      { key: "type", header: "Type", type: "string" },
    ];
    const rows = [{ type: "SALE" }];

    render(<ReportTable columns={columns} rows={rows} />);

    // No badge, renders as plain span
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
    expect(screen.getByText("SALE")).toBeInTheDocument();
  });

  // --- Column alignment ---

  it("Given: column with align right When: rendering Then: table head should have text-right", () => {
    const columns: ReportColumn[] = [
      { key: "amount", header: "Amount", type: "string", align: "right" },
    ];
    const rows = [{ amount: "100" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).toContain("text-right");
  });

  it("Given: column with align center When: rendering Then: table head should have text-center", () => {
    const columns: ReportColumn[] = [
      { key: "code", header: "Code", type: "string", align: "center" },
    ];
    const rows = [{ code: "ABC" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).toContain("text-center");
  });

  it("Given: currency column (implicit right alignment) When: rendering Then: should have text-right", () => {
    const columns: ReportColumn[] = [
      { key: "total", header: "Total", type: "currency" },
    ];
    const rows = [{ total: 1500 }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).toContain("text-right");
  });

  it("Given: number column (implicit right alignment) When: rendering Then: should have text-right", () => {
    const columns: ReportColumn[] = [
      { key: "qty", header: "Qty", type: "number" },
    ];
    const rows = [{ qty: 42 }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).toContain("text-right");
  });

  it("Given: string column with no align When: rendering Then: should have text-left", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string" },
    ];
    const rows = [{ name: "Test" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).toContain("text-left");
  });

  // --- Column width ---

  it("Given: column with width When: rendering Then: table head should have style width", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", width: "200px" },
    ];
    const rows = [{ name: "Test" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.style.width).toBe("200px");
  });

  // --- Non-sortable column ---

  it("Given: column with sortable false When: rendering Then: should not have cursor-pointer class", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", sortable: false },
    ];
    const rows = [{ name: "Test" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const th = container.querySelector("th");
    expect(th?.className).not.toContain("cursor-pointer");
  });

  // --- Sort cycling: asc -> desc -> null ---

  it("Given: sortable column When: clicking 3 times Then: should cycle asc -> desc -> unsorted", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", sortable: true },
    ];
    const rows = [{ name: "Bravo" }, { name: "Alpha" }, { name: "Charlie" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const nameHeader = screen.getByText("columnHeaders.Name").closest("th")!;

    // Click 1: asc
    fireEvent.click(nameHeader);
    let cells = container.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("Alpha");

    // Click 2: desc
    fireEvent.click(nameHeader);
    cells = container.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("Charlie");

    // Click 3: reset to original order
    fireEvent.click(nameHeader);
    cells = container.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("Bravo");
  });

  // --- Sort with null/undefined values ---

  it("Given: column with null values When: sorting asc Then: nulls should appear at the end", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", sortable: true },
    ];
    const rows = [
      { name: null },
      { name: "Alpha" },
      { name: undefined },
      { name: "Bravo" },
    ];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const nameHeader = screen.getByText("columnHeaders.Name").closest("th")!;
    fireEvent.click(nameHeader); // asc

    const cells = container.querySelectorAll("tbody td");
    // Non-null values first, then nulls
    expect(cells[0].textContent).toBe("Alpha");
    expect(cells[1].textContent).toBe("Bravo");
  });

  // --- Sorting equal values ---

  it("Given: column with equal values When: sorting Then: should maintain order for equal items", () => {
    const columns: ReportColumn[] = [
      { key: "qty", header: "Qty", type: "number", sortable: true },
    ];
    const rows = [{ qty: 10 }, { qty: 10 }, { qty: 5 }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const header = screen.getByText("columnHeaders.Qty").closest("th")!;
    fireEvent.click(header); // asc

    const cells = container.querySelectorAll("tbody td");
    expect(cells[0].textContent).toBe("5");
    expect(cells[1].textContent).toBe("10");
  });

  // --- Switch sort column ---

  it("Given: sorted by one column When: clicking different column Then: should sort by new column asc", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string", sortable: true },
      { key: "qty", header: "Qty", type: "number", sortable: true },
    ];
    const rows = [
      { name: "Bravo", qty: 10 },
      { name: "Alpha", qty: 30 },
      { name: "Charlie", qty: 20 },
    ];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    // Sort by name asc
    fireEvent.click(screen.getByText("columnHeaders.Name").closest("th")!);
    let firstCells = container.querySelectorAll("tbody tr:first-child td");
    expect(firstCells[0].textContent).toBe("Alpha");

    // Switch to sort by qty asc
    fireEvent.click(screen.getByText("columnHeaders.Qty").closest("th")!);
    firstCells = container.querySelectorAll("tbody tr:first-child td");
    expect(firstCells[1].textContent).toBe("10");
  });

  // --- Font mono for numeric types ---

  it("Given: currency column When: rendering cell Then: should have font-mono class", () => {
    const columns: ReportColumn[] = [
      { key: "total", header: "Total", type: "currency" },
    ];
    const rows = [{ total: 1500 }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const span = container.querySelector("tbody td span");
    expect(span?.className).toContain("font-mono");
  });

  it("Given: percentage column When: rendering cell Then: should have font-mono class", () => {
    const columns: ReportColumn[] = [
      { key: "pct", header: "Pct", type: "percentage" },
    ];
    const rows = [{ pct: 42 }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const span = container.querySelector("tbody td span");
    expect(span?.className).toContain("font-mono");
  });

  it("Given: string column When: rendering cell Then: should NOT have font-mono class", () => {
    const columns: ReportColumn[] = [
      { key: "name", header: "Name", type: "string" },
    ];
    const rows = [{ name: "Test" }];

    const { container } = render(<ReportTable columns={columns} rows={rows} />);

    const span = container.querySelector("tbody td span");
    expect(span?.className).not.toContain("font-mono");
  });
});
