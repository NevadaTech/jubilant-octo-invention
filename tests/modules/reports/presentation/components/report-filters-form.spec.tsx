import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReportFiltersForm } from "@/modules/reports/presentation/components/report-filters-form";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/modules/inventory/presentation/hooks/use-warehouses", () => ({
  useWarehouses: () => ({ data: { data: [{ id: "wh-1", name: "Main" }] } }),
}));

vi.mock("@/modules/inventory/presentation/hooks/use-categories", () => ({
  useCategories: () => ({
    data: { data: [{ id: "cat-1", name: "Electronics" }] },
  }),
}));

describe("ReportFiltersForm", () => {
  const mockOnGenerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Given: SALES report type When: rendering Then: should call onGenerate on mount with default params", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  it("Given: SALES report type When: rendering Then: should show filter title", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.title")).toBeDefined();
  });

  it("Given: SALES report type When: rendered Then: should show status filter", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.status")).toBeDefined();
  });

  it("Given: AVAILABLE_INVENTORY report type When: rendering Then: should call onGenerate on mount", () => {
    render(
      <ReportFiltersForm
        type="AVAILABLE_INVENTORY"
        onGenerate={mockOnGenerate}
      />,
    );
    expect(mockOnGenerate).toHaveBeenCalledTimes(1);
  });

  it("Given: SALES report type When: rendering Then: should show date range filters", () => {
    render(<ReportFiltersForm type="SALES" onGenerate={mockOnGenerate} />);
    expect(screen.getByText("filters.startDate")).toBeDefined();
    expect(screen.getByText("filters.endDate")).toBeDefined();
  });
});
