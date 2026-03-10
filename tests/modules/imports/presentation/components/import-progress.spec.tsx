import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportBatch } from "@/modules/imports/domain/entities/import-batch.entity";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/ui/components/progress", () => ({
  Progress: ({ value }: { value: number }) => (
    <div data-testid="progress-bar" data-value={value} />
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

const mockDownloadErrors = {
  mutate: vi.fn(),
  isPending: false,
};

vi.mock("@/modules/imports/presentation/hooks/use-imports", () => ({
  useImportStatus: () => ({ data: mockBatchData }),
  useDownloadErrors: () => mockDownloadErrors,
}));

import { ImportProgress } from "@/modules/imports/presentation/components/import-progress";

describe("ImportProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockBatchData = null;
  });

  it("Given: no batch data and no initialBatch When: rendering Then: should render nothing", () => {
    mockBatchData = null;
    const { container } = render(<ImportProgress batchId="batch-1" />);

    expect(container.innerHTML).toBe("");
  });

  it("Given: a processing batch via query When: rendering Then: should show progress title", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PROCESSING",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 50,
      validRows: 45,
      invalidRows: 5,
      progress: 50,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("execute.title")).toBeInTheDocument();
  });

  it("Given: a processing batch When: rendering Then: should show progress bar", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PROCESSING",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 50,
      validRows: 45,
      invalidRows: 5,
      progress: 50,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" />);

    const progressBar = screen.getByTestId("progress-bar");
    expect(progressBar).toHaveAttribute("data-value", "50");
  });

  it("Given: a processing batch When: rendering Then: should show progress percentage", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PROCESSING",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 50,
      validRows: 45,
      invalidRows: 5,
      progress: 50,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("Given: a processing batch When: rendering Then: should show status badge", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PROCESSING",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 50,
      validRows: 45,
      invalidRows: 5,
      progress: 50,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByTestId("status-badge")).toHaveTextContent("PROCESSING");
  });

  it("Given: a completed batch When: rendering Then: should show completed message", () => {
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
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("execute.completed")).toBeInTheDocument();
    expect(screen.getByText("95 / 100")).toBeInTheDocument();
  });

  it("Given: a completed batch When: rendering Then: should not show failed message", () => {
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
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.queryByText("execute.failed")).not.toBeInTheDocument();
  });

  it("Given: a failed batch When: rendering Then: should show failed message", () => {
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
      errorMessage: "File format error",
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("execute.failed")).toBeInTheDocument();
    expect(screen.getByText("File format error")).toBeInTheDocument();
  });

  it("Given: a failed batch When: rendering Then: should show download errors button", () => {
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
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("errorReport.download")).toBeInTheDocument();
  });

  it("Given: a failed batch without errorMessage When: rendering Then: should not show error text", () => {
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
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.getByText("execute.failed")).toBeInTheDocument();
    expect(screen.queryByText("File format error")).not.toBeInTheDocument();
  });

  it("Given: a processing batch When: rendering Then: should not show completed or failed messages", () => {
    mockBatchData = ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PROCESSING",
      fileName: "products.csv",
      totalRows: 100,
      processedRows: 50,
      validRows: 45,
      invalidRows: 5,
      progress: 50,
      createdBy: "user-1",
      createdAt: "2026-01-15T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" />);

    expect(screen.queryByText("execute.completed")).not.toBeInTheDocument();
    expect(screen.queryByText("execute.failed")).not.toBeInTheDocument();
  });

  it("Given: no query data but initialBatch provided When: rendering Then: should use initialBatch", () => {
    mockBatchData = null;
    const initialBatch = ImportBatch.create("batch-1", {
      type: "MOVEMENTS",
      status: "PENDING",
      fileName: "movements.csv",
      totalRows: 200,
      processedRows: 0,
      validRows: 0,
      invalidRows: 0,
      progress: 0,
      createdBy: "user-1",
      createdAt: "2026-02-01T10:00:00.000Z",
    });

    render(<ImportProgress batchId="batch-1" initialBatch={initialBatch} />);

    expect(screen.getByText("execute.title")).toBeInTheDocument();
    expect(screen.getByText("0%")).toBeInTheDocument();
  });
});
