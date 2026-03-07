import { describe, it, expect } from "vitest";
import { ImportBatch } from "@/modules/imports/domain/entities/import-batch.entity";

describe("ImportBatch", () => {
  const createBatch = (overrides = {}) =>
    ImportBatch.create("batch-1", {
      type: "PRODUCTS",
      status: "PENDING",
      fileName: "test.csv",
      totalRows: 100,
      processedRows: 0,
      validRows: 0,
      invalidRows: 0,
      progress: 0,
      createdBy: "user-1",
      createdAt: "2024-01-01T00:00:00Z",
      ...overrides,
    });

  it("should create a batch with correct properties", () => {
    const batch = createBatch();
    expect(batch.id).toBe("batch-1");
    expect(batch.type).toBe("PRODUCTS");
    expect(batch.status).toBe("PENDING");
    expect(batch.fileName).toBe("test.csv");
  });

  it("should compute isTerminal for COMPLETED", () => {
    expect(createBatch({ status: "COMPLETED" }).isTerminal).toBe(true);
  });

  it("should compute isTerminal for FAILED", () => {
    expect(createBatch({ status: "FAILED" }).isTerminal).toBe(true);
  });

  it("should not be terminal for PROCESSING", () => {
    expect(createBatch({ status: "PROCESSING" }).isTerminal).toBe(false);
  });

  it("should compute isProcessing", () => {
    expect(createBatch({ status: "PROCESSING" }).isProcessing).toBe(true);
    expect(createBatch({ status: "VALIDATING" }).isProcessing).toBe(true);
    expect(createBatch({ status: "PENDING" }).isProcessing).toBe(false);
  });

  it("should compute successRate", () => {
    const batch = createBatch({ totalRows: 100, validRows: 80 });
    expect(batch.successRate).toBe(80);
  });

  it("should return 0 successRate for no rows", () => {
    const batch = createBatch({ totalRows: 0, validRows: 0 });
    expect(batch.successRate).toBe(0);
  });
});
