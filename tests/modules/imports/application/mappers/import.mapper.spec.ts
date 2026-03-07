import { describe, it, expect } from "vitest";
import { ImportMapper } from "@/modules/imports/application/mappers/import.mapper";
import type {
  ImportBatchApiDto,
  ImportPreviewResponseDto,
} from "@/modules/imports/application/dto/import.dto";

describe("ImportMapper", () => {
  describe("toDomain", () => {
    it("should map API DTO to domain entity", () => {
      const dto: ImportBatchApiDto = {
        id: "batch-1",
        type: "PRODUCTS",
        status: "COMPLETED",
        fileName: "products.csv",
        totalRows: 100,
        processedRows: 100,
        validRows: 95,
        invalidRows: 5,
        progress: 100,
        createdBy: "user-1",
        createdAt: "2024-01-01T00:00:00Z",
        completedAt: "2024-01-01T00:05:00Z",
      };

      const batch = ImportMapper.toDomain(dto);

      expect(batch.id).toBe("batch-1");
      expect(batch.type).toBe("PRODUCTS");
      expect(batch.status).toBe("COMPLETED");
      expect(batch.isTerminal).toBe(true);
      expect(batch.successRate).toBe(95);
    });
  });

  describe("toPreview", () => {
    it("should map preview response to domain", () => {
      const dto: ImportPreviewResponseDto = {
        success: true,
        message: "ok",
        data: {
          totalRows: 10,
          validRows: 8,
          invalidRows: 2,
          structureErrors: ["Missing column: SKU"],
          rowErrors: [
            { rowNumber: 3, error: "Missing name", severity: "error" },
          ],
          warnings: ["Unknown column ignored"],
        },
        timestamp: "2024-01-01",
      };

      const preview = ImportMapper.toPreview(dto);

      expect(preview.totalRows).toBe(10);
      expect(preview.validRows).toBe(8);
      expect(preview.invalidRows).toBe(2);
      expect(preview.canBeProcessed).toBe(false);
      expect(preview.structureErrors).toHaveLength(1);
      expect(preview.rowErrors).toHaveLength(1);
      expect(preview.hasWarnings).toBe(true);
    });
  });
});
