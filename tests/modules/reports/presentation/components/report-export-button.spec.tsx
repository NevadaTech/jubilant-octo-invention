import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReportExportButton } from "@/modules/reports/presentation/components/report-export-button";

// --- Mocks ---

const mockMutate = vi.fn();
let mockIsPending = false;

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}:${JSON.stringify(params)}` : key,
}));

vi.mock("@/modules/reports/presentation/hooks/use-reports", () => ({
  useReportExport: () => ({
    mutate: mockMutate,
    isPending: mockIsPending,
  }),
}));

vi.mock("@/ui/components/button", () => ({
  Button: ({
    children,
    disabled,
    onClick,
    ...props
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    [key: string]: unknown;
  }) => (
    <button data-testid="export-button" disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/ui/components/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({
    children,
    asChild,
  }: {
    children: React.ReactNode;
    asChild?: boolean;
  }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-content">{children}</div>
  ),
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="dropdown-item" onClick={onClick}>
      {children}
    </button>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}));

vi.mock("lucide-react", () => {
  const Icon = ({ className }: { className?: string }) => (
    <svg data-testid="icon" className={className} />
  );
  return {
    Download: Icon,
    FileSpreadsheet: Icon,
    FileCode: Icon,
  };
});

// --- Tests ---

describe("ReportExportButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
  });

  it("Given: not pending When: rendering Then: should display the export button text", () => {
    // Arrange & Act
    render(<ReportExportButton type="SALES" />);

    // Assert
    expect(screen.getByText("export")).toBeDefined();
  });

  it("Given: pending state When: rendering Then: should display generating text and be disabled", () => {
    // Arrange
    mockIsPending = true;

    // Act
    render(<ReportExportButton type="SALES" />);

    // Assert
    expect(screen.getByText("generating")).toBeDefined();
    const button = screen.getByTestId("export-button");
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("Given: disabled prop When: rendering Then: should disable the export button", () => {
    // Arrange & Act
    render(<ReportExportButton type="SALES" disabled={true} />);

    // Assert
    const button = screen.getByTestId("export-button");
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  it("Given: dropdown menu When: rendering Then: should display Excel and CSV export options", () => {
    // Arrange & Act
    render(<ReportExportButton type="SALES" />);

    // Assert
    expect(screen.getByText("exportExcel")).toBeDefined();
    expect(screen.getByText("exportCsv")).toBeDefined();
    expect(screen.getByText("exportFormat")).toBeDefined();
  });

  it("Given: Excel option When: clicking Then: should call mutate with EXCEL format", () => {
    // Arrange
    render(
      <ReportExportButton
        type="VALUATION"
        parameters={{ warehouseIds: ["w1"] }}
        reportTitle="Test Report"
      />,
    );

    // Act
    const items = screen.getAllByTestId("dropdown-item");
    const excelItem = items.find((el) =>
      el.textContent?.includes("exportExcel"),
    );
    fireEvent.click(excelItem!);

    // Assert
    expect(mockMutate).toHaveBeenCalledWith({
      type: "VALUATION",
      format: "EXCEL",
      parameters: { warehouseIds: ["w1"] },
      options: {
        includeHeader: true,
        includeSummary: true,
        title: "Test Report",
      },
    });
  });

  it("Given: CSV option When: clicking Then: should call mutate with CSV format", () => {
    // Arrange
    render(<ReportExportButton type="RETURNS" />);

    // Act
    const items = screen.getAllByTestId("dropdown-item");
    const csvItem = items.find((el) => el.textContent?.includes("exportCsv"));
    fireEvent.click(csvItem!);

    // Assert
    expect(mockMutate).toHaveBeenCalledWith({
      type: "RETURNS",
      format: "CSV",
      parameters: undefined,
      options: {
        includeHeader: true,
        includeSummary: true,
        title: undefined,
      },
    });
  });
});
