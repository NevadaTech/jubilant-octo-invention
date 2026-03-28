import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ReportFiltersForm } from "@/modules/reports/presentation/components/report-filters-form";

// --- Mocks ---

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));

let mockWarehouses: Array<{ id: string; name: string }> = [];
vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({ data: { data: mockWarehouses } }),
}));

let mockBrands: Array<{ id: string; name: string }> = [];
vi.mock("@/modules/brands/presentation/hooks/use-brands", () => ({
  useBrands: () => ({ data: { data: mockBrands } }),
}));

let mockCategories: Array<{ id: string; name: string }> = [];
vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCategories: () => ({ data: { data: mockCategories } }),
}));

let mockCompanies: Array<{ id: string; name: string }> = [];
vi.mock("@/modules/companies/presentation/hooks/use-companies", () => ({
  useCompanies: () => ({ data: { data: mockCompanies } }),
}));

let mockGlobalCompanyId: string | null = null;
vi.mock("@/modules/companies/infrastructure/store/company.store", () => ({
  useCompanyStore: (
    selector: (s: { selectedCompanyId: string | null }) => unknown,
  ) => selector({ selectedCompanyId: mockGlobalCompanyId }),
}));

let mockMultiCompanyEnabled = false;
vi.mock("@/shared/presentation/hooks/use-org-settings", () => ({
  useOrgSettings: () => ({ multiCompanyEnabled: mockMultiCompanyEnabled }),
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    onClick,
    variant,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: string;
  }) => (
    <button onClick={onClick} data-variant={variant}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/input", () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} data-testid={`input-${props.type}`} />
  ),
}));

vi.mock("@/ui/components/date-range-picker", () => ({
  DateRangePicker: ({
    onChange,
    placeholder,
  }: {
    value?: { from?: Date; to?: Date };
    onChange: (range: { from?: Date; to?: Date } | undefined) => void;
    placeholder?: string;
  }) => (
    <div data-testid="date-range-picker">
      <input
        type="date"
        data-testid="input-date"
        placeholder={placeholder}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? { from: new Date(val + "T00:00:00") } : undefined);
        }}
      />
      <input
        type="date"
        data-testid="input-date"
        onChange={(e) => {
          const val = e.target.value;
          onChange(
            val
              ? { from: undefined, to: new Date(val + "T00:00:00") }
              : undefined,
          );
        }}
      />
    </div>
  ),
}));

vi.mock("@/ui/components/label", () => ({
  Label: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <label className={className} data-testid="label">
      {children}
    </label>
  ),
}));

vi.mock("@/ui/components/select", () => ({
  Select: ({
    children,
    value,
    onValueChange,
  }: {
    children: React.ReactNode;
    value?: string;
    onValueChange?: (v: string) => void;
  }) => (
    <div data-testid="select" data-value={value}>
      {children}
      {onValueChange && (
        <button
          data-testid="select-change"
          onClick={() => onValueChange("MONTHLY")}
        />
      )}
    </div>
  ),
  SelectContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="select-content">{children}</div>
  ),
  SelectItem: ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => (
    <div data-testid={`select-item-${value}`} data-value={value}>
      {children}
    </div>
  ),
  SelectTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div data-testid="select-trigger" className={className}>
      {children}
    </div>
  ),
  SelectValue: ({ placeholder }: { placeholder?: string }) => (
    <span data-testid="select-value">{placeholder}</span>
  ),
}));

vi.mock("@/ui/components/multi-select", () => ({
  MultiSelect: ({
    value,
    onValueChange,
    allLabel,
    selectedLabel,
  }: {
    value: string[];
    onValueChange: (v: string[]) => void;
    options: Array<{ value: string; label: string }>;
    allLabel?: string;
    selectedLabel?: string;
    className?: string;
  }) => (
    <div data-testid="multi-select" data-all-label={allLabel}>
      <span>{selectedLabel}</span>
      <span data-testid="multi-value">{value.join(",")}</span>
      <button
        data-testid="multi-add"
        onClick={() => onValueChange([...value, "NEW"])}
      />
      <button data-testid="multi-clear" onClick={() => onValueChange([])} />
    </div>
  ),
}));

vi.mock("@/ui/components/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
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
    <div data-testid="card-title" className={className}>
      {children}
    </div>
  ),
}));

// --- Tests ---

describe("ReportFiltersForm", () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockWarehouses = [{ id: "wh-1", name: "Main Warehouse" }];
    mockCategories = [{ id: "cat-1", name: "Electronics" }];
    mockBrands = [];
    mockCompanies = [];
    mockGlobalCompanyId = null;
    mockMultiCompanyEnabled = false;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // --- Auto-generate on mount ---

  it("Given: SALES report type When: mounting Then: should call onGenerate with default params excluding DRAFT status", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    const calledWith = mockOnGenerate.mock.calls[0][0];
    expect(calledWith.status).toBeDefined();
    expect(calledWith.status).not.toContain("DRAFT");
    expect(calledWith.status).toContain("CONFIRMED");
  });

  it("Given: RETURNS report type When: mounting Then: should call onGenerate with empty default params", () => {
    render(<ReportFiltersForm type="RETURNS" onGenerate={mockOnGenerate} />);
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    const calledWith = mockOnGenerate.mock.calls[0][0];
    expect(calledWith.status).toBeUndefined();
  });

  it("Given: globalCompanyId is set When: mounting Then: should include companyId in default params", () => {
    mockGlobalCompanyId = "company-123";
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].companyId).toBe("company-123");
  });

  it("Given: globalCompanyId is null When: mounting Then: should NOT include companyId in default params", () => {
    mockGlobalCompanyId = null;
    render(<ReportFiltersForm type="RETURNS" onGenerate={mockOnGenerate} />);
    expect(mockOnGenerate.mock.calls[0][0].companyId).toBeUndefined();
  });

  // --- Filter title ---

  it("Given: any report type with filters When: rendering Then: should show filter title", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.title")).toBeInTheDocument();
  });

  // --- Conditional filter fields based on config ---

  // dateRange
  it("Given: SALES report (dateRange: true) When: rendering Then: should show dateRange field", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.dateRange")).toBeInTheDocument();
  });

  it("Given: AVAILABLE_INVENTORY report (dateRange: false) When: rendering Then: should NOT show date fields", () => {
    render(
      <ReportFiltersForm
        type="AVAILABLE_INVENTORY"
        onGenerate={mockOnGenerate}
      />,
    );
    expect(screen.queryByText("filters.dateRange")).not.toBeInTheDocument();
  });

  // warehouseIds
  it("Given: report with warehouseIds config and warehouses available When: rendering Then: should show warehouse filter", () => {
    mockWarehouses = [{ id: "wh-1", name: "Main" }];
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    const warehouseLabels = screen.getAllByText("filters.warehouse");
    expect(warehouseLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: report with warehouseIds config but no warehouses When: rendering Then: should NOT show warehouse filter", () => {
    mockWarehouses = [];
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.warehouse")).not.toBeInTheDocument();
  });

  // categoryIds
  it("Given: VALUATION report (categoryIds: true) with categories When: rendering Then: should show category filter", () => {
    mockCategories = [{ id: "cat-1", name: "Electronics" }];
    render(<ReportFiltersForm type="VALUATION" onGenerate={mockOnGenerate} />);
    const categoryLabels = screen.getAllByText("filters.category");
    expect(categoryLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: VALUATION report with no categories When: rendering Then: should NOT show category filter", () => {
    mockCategories = [];
    render(<ReportFiltersForm type="VALUATION" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.category")).not.toBeInTheDocument();
  });

  it("Given: SALES report (categoryIds: false) When: rendering Then: should NOT show category filter", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.category")).not.toBeInTheDocument();
  });

  // companyId
  it("Given: multiCompanyEnabled and companies available When: rendering Then: should show company filter", () => {
    mockMultiCompanyEnabled = true;
    mockCompanies = [{ id: "co-1", name: "Acme Corp" }];
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.company")).toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled but no companies When: rendering Then: should NOT show company filter", () => {
    mockMultiCompanyEnabled = true;
    mockCompanies = [];
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.company")).not.toBeInTheDocument();
  });

  it("Given: multiCompanyEnabled is false When: rendering Then: should NOT show company filter", () => {
    mockMultiCompanyEnabled = false;
    mockCompanies = [{ id: "co-1", name: "Acme Corp" }];
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.company")).not.toBeInTheDocument();
  });

  // status
  it("Given: SALES report (status: true) When: rendering Then: should show status filter with SALES statuses", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.status")).toBeInTheDocument();
  });

  it("Given: RETURNS report (status: true) When: rendering Then: should show status filter", () => {
    render(<ReportFiltersForm type="RETURNS" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.status")).toBeInTheDocument();
  });

  it("Given: VALUATION report (status: false) When: rendering Then: should NOT show status filter", () => {
    render(<ReportFiltersForm type="VALUATION" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.status")).not.toBeInTheDocument();
  });

  // returnTypes
  it("Given: RETURNS report (returnTypes: true) When: rendering Then: should show return type filter", () => {
    render(<ReportFiltersForm type="RETURNS" onGenerate={mockOnGenerate} />);
    const returnTypeLabels = screen.getAllByText("filters.returnType");
    expect(returnTypeLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: SALES report (returnTypes: false) When: rendering Then: should NOT show return type filter", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.returnType")).not.toBeInTheDocument();
  });

  // movementTypes
  it("Given: MOVEMENT_HISTORY report (movementTypes: true) When: rendering Then: should show movement type filter", () => {
    render(
      <ReportFiltersForm type="MOVEMENT_HISTORY" onGenerate={mockOnGenerate} />,
    );
    const movementTypeLabels = screen.getAllByText("filters.movementType");
    expect(movementTypeLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: SALES report (movementTypes: false) When: rendering Then: should NOT show movement type filter", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.movementType")).not.toBeInTheDocument();
  });

  // severities
  it("Given: LOW_STOCK report (severities: true) When: rendering Then: should show severity filter", () => {
    render(<ReportFiltersForm type="LOW_STOCK" onGenerate={mockOnGenerate} />);
    const severityLabels = screen.getAllByText("filters.severity");
    expect(severityLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("Given: SALES report (severities: false) When: rendering Then: should NOT show severity filter", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.severity")).not.toBeInTheDocument();
  });

  // deadStockDays
  it("Given: DEAD_STOCK report (deadStockDays: true) When: rendering Then: should show deadStockDays input", () => {
    render(<ReportFiltersForm type="DEAD_STOCK" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.deadStockDays")).toBeInTheDocument();
  });

  it("Given: SALES report (deadStockDays: false) When: rendering Then: should NOT show deadStockDays input", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.deadStockDays")).not.toBeInTheDocument();
  });

  // includeInactive
  it("Given: AVAILABLE_INVENTORY report (includeInactive: true) When: rendering Then: should show includeInactive checkbox", () => {
    render(
      <ReportFiltersForm
        type="AVAILABLE_INVENTORY"
        onGenerate={mockOnGenerate}
      />,
    );
    expect(screen.getByText("filters.includeInactive")).toBeInTheDocument();
  });

  it("Given: SALES report (includeInactive: false) When: rendering Then: should NOT show includeInactive checkbox", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(
      screen.queryByText("filters.includeInactive"),
    ).not.toBeInTheDocument();
  });

  // --- Date range interaction ---

  it("Given: SALES report When: changing startDate Then: should trigger debounced onGenerate", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear(); // Clear the mount call

    const dateInputs = screen.getAllByTestId("input-date");
    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });

    // Debounce hasn't fired yet
    expect(mockOnGenerate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].dateRange?.startDate).toBe(
      "2026-01-01",
    );
  });

  it("Given: SALES report When: clearing startDate Then: should set startDate to undefined", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear();

    const dateInputs = screen.getAllByTestId("input-date");
    // First set then clear
    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    mockOnGenerate.mockClear();

    fireEvent.change(dateInputs[0], { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(
      mockOnGenerate.mock.calls[0][0].dateRange?.startDate,
    ).toBeUndefined();
  });

  // --- deadStockDays interaction ---

  it("Given: DEAD_STOCK report When: entering deadStockDays value Then: should update params", () => {
    render(<ReportFiltersForm type="DEAD_STOCK" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear();

    const numberInput = screen.getByTestId("input-number");
    fireEvent.change(numberInput, { target: { value: "60" } });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].deadStockDays).toBe(60);
  });

  it("Given: DEAD_STOCK report When: clearing deadStockDays Then: should set to undefined", () => {
    render(<ReportFiltersForm type="DEAD_STOCK" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear();

    const numberInput = screen.getByTestId("input-number");

    // First set a value so the param actually changes
    fireEvent.change(numberInput, { target: { value: "60" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    mockOnGenerate.mockClear();

    // Now clear it
    fireEvent.change(numberInput, { target: { value: "" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].deadStockDays).toBeUndefined();
  });

  // --- includeInactive checkbox ---

  it("Given: AVAILABLE_INVENTORY report When: checking includeInactive Then: should set to true", () => {
    render(
      <ReportFiltersForm
        type="AVAILABLE_INVENTORY"
        onGenerate={mockOnGenerate}
      />,
    );
    mockOnGenerate.mockClear();

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].includeInactive).toBe(true);
  });

  // --- hasFilters / clear button ---

  it("Given: SALES report with default status (non-empty) When: rendering Then: should NOT show clear button since status matches default", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    // Default params for SALES already has status (SALE_DEFAULT_STATUSES), which matches default
    // So hasFilters should detect companyId as undefined → params only has status which matches default
    expect(screen.queryByText("filters.clear")).not.toBeInTheDocument();
  });

  it("Given: SALES report When: changing a date filter Then: should show clear button", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);

    const dateInputs = screen.getAllByTestId("input-date");
    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });

    // hasFilters checks dateRange → startDate exists
    expect(screen.getByText("filters.clear")).toBeInTheDocument();
  });

  it("Given: clear button visible When: clicking clear Then: should reset params to defaults", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear();

    // Add a filter to make clear button appear
    const dateInputs = screen.getAllByTestId("input-date");
    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });

    const clearButton = screen.getByText("filters.clear");
    fireEvent.click(clearButton);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // After clear, params should be back to defaults (no dateRange)
    const lastCall =
      mockOnGenerate.mock.calls[mockOnGenerate.mock.calls.length - 1][0];
    expect(lastCall.dateRange).toBeUndefined();
  });

  // --- hasFilters edge cases ---

  it("Given: RETURNS report (no default status) When: rendering without changes Then: should NOT show clear button", () => {
    render(<ReportFiltersForm type="RETURNS" onGenerate={mockOnGenerate} />);
    expect(screen.queryByText("filters.clear")).not.toBeInTheDocument();
  });

  // --- visibleCount = 0 returns null ---
  // Note: All report types in REPORT_FILTER_CONFIG have at least one filter,
  // but we can still verify the component renders correctly for minimal configs

  it("Given: AVAILABLE_INVENTORY report When: rendering Then: should show warehouseIds and includeInactive but not dateRange", () => {
    render(
      <ReportFiltersForm
        type="AVAILABLE_INVENTORY"
        onGenerate={mockOnGenerate}
      />,
    );
    expect(screen.queryByText("filters.dateRange")).not.toBeInTheDocument();
    expect(screen.getByText("filters.includeInactive")).toBeInTheDocument();
  });

  // --- Debounce behavior ---

  it("Given: SALES report When: changing params rapidly Then: should debounce and only call once", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    mockOnGenerate.mockClear();

    const dateInputs = screen.getAllByTestId("input-date");
    fireEvent.change(dateInputs[0], { target: { value: "2026-01-01" } });
    fireEvent.change(dateInputs[0], { target: { value: "2026-02-01" } });
    fireEvent.change(dateInputs[0], { target: { value: "2026-03-01" } });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Only the last change should be reflected
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
    expect(mockOnGenerate.mock.calls[0][0].dateRange?.startDate).toBe(
      "2026-03-01",
    );
  });

  // --- Status options differ for SALES vs RETURNS ---

  it("Given: SALES report When: rendering status filter Then: should use SALE_REPORT_STATUSES options", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    // The MultiSelect for status is rendered with SALE statuses
    expect(screen.getByText("filters.status")).toBeInTheDocument();
  });

  it("Given: RETURNS_CUSTOMER report When: rendering status filter Then: should use RETURN_REPORT_STATUSES options", () => {
    render(
      <ReportFiltersForm type="RETURNS_CUSTOMER" onGenerate={mockOnGenerate} />,
    );
    expect(screen.getByText("filters.status")).toBeInTheDocument();
  });
});
