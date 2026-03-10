import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportBatch } from "@/modules/imports/domain/entities/import-batch.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/sheet", () => ({
  Sheet: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-content">{children}</div>
  ),
  SheetHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-header">{children}</div>
  ),
  SheetTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="sheet-title">{children}</h2>
  ),
  SheetDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="sheet-description">{children}</p>
  ),
  SheetBody: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sheet-body">{children}</div>
  ),
}));

vi.mock(
  "@/modules/imports/presentation/components/import-status-badge",
  () => ({
    ImportStatusBadge: ({ status }: { status: string }) => (
      <span data-testid="status-badge">{status}</span>
    ),
  }),
);

let mockBatchData: ImportBatch | null = null;
let mockIsLoading = false;

vi.mock("@/modules/imports/presentation/hooks/use-imports", () => ({
  useImportStatus: () => ({ data: mockBatchData, isLoading: mockIsLoading }),
}));

import { ImportDetailSheet } from "@/modules/imports/presentation/components/import-detail";

describe("ImportDetailSheet", () => {
  beforeEach(() => {
    mockBatchData = null;
    mockIsLoading = false;
  });

  it("Given: batchId is null When: rendering Then: should not show sheet", () => {
    render(<ImportDetailSheet batchId={null} onClose={vi.fn()} />);

    expect(screen.queryByTestId("sheet")).not.toBeInTheDocument();
  });

  it("Given: batchId is set When: rendering Then: should show sheet", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 95,
      invalidRows: 5,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByTestId("sheet")).toBeInTheDocument();
  });

  it("Given: batch data loaded When: rendering Then: should show sheet title", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 95,
      invalidRows: 5,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("detail.title")).toBeInTheDocument();
  });

  it("Given: batch data loaded When: rendering Then: should show file name in description", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 95,
      invalidRows: 5,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("products.csv")).toBeInTheDocument();
  });

  it("Given: batch data loaded When: rendering Then: should show summary section", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 95,
      invalidRows: 5,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("detail.summary")).toBeInTheDocument();
    expect(screen.getByText("detail.type")).toBeInTheDocument();
    expect(screen.getByText("detail.status")).toBeInTheDocument();
    expect(screen.getByText("detail.totalRows")).toBeInTheDocument();
    expect(screen.getByText("detail.validRows")).toBeInTheDocument();
    expect(screen.getByText("detail.invalidRows")).toBeInTheDocument();
  });

  it("Given: batch data with status badge When: rendering Then: should show status badge", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 95,
      invalidRows: 5,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("COMPLETED");
  });

  it("Given: batch with errorMessage When: rendering Then: should show error message", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "FAILED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 30,
      validRows: 0,
      invalidRows: 30,
      progress: 30,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      errorMessage: "Invalid file format",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("Invalid file format")).toBeInTheDocument();
  });

  it("Given: batch without errorMessage When: rendering Then: should not show error panel", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 100,
      validRows: 100,
      invalidRows: 0,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.queryByText("Invalid file format")).not.toBeInTheDocument();
  });

  it("Given: batch with rows When: rendering Then: should show row cards", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 2,
      processedRows: 2,
      validRows: 1,
      invalidRows: 1,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [
        {
          rowNumber: 1,
          data: { name: "Product A", sku: "SKU-001" },
          isValid: true,
          errors: [],
          warnings: [],
        },
        {
          rowNumber: 2,
          data: { name: "Product B", sku: "" },
          isValid: false,
          errors: ["SKU is required"],
          warnings: ["Price is missing"],
        },
      ],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("detail.importedData")).toBeInTheDocument();
    expect(screen.getByText("Product A")).toBeInTheDocument();
    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(screen.getByText("Product B")).toBeInTheDocument();
    expect(screen.getByText("SKU is required")).toBeInTheDocument();
    expect(screen.getByText("Price is missing")).toBeInTheDocument();
  });

  it("Given: batch with no rows When: rendering Then: should show no rows message", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "COMPLETED",
      fileName: "products.csv",
      totalRows: 0,
      processedRows: 0,
      validRows: 0,
      invalidRows: 0,
      progress: 100,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
      rows: [],
    });

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("detail.noRows")).toBeInTheDocument();
  });

  it("Given: loading state When: rendering Then: should not show batch data", () => {
    mockIsLoading = true;

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.queryByText("detail.summary")).not.toBeInTheDocument();
  });

  it("Given: not loading and no batch data When: rendering Then: should show empty state", () => {
    mockBatchData = null;
    mockIsLoading = false;

    render(<ImportDetailSheet batchId="batch-1" onClose={vi.fn()} />);

    expect(screen.getByText("history.empty")).toBeInTheDocument();
  });
});
