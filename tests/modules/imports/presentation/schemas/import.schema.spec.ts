import { describe, it, expect } from "vitest";
import {
  importFileSchema,
  IMPORT_TYPES,
} from "@/modules/imports/presentation/schemas/import.schema";

describe("Import Schemas", () => {
  describe("importFileSchema", () => {
    it("Given: a valid CSV file under 10MB When: parsing Then: should pass validation", () => {
      const file = new File(["csv content"], "data.csv", { type: "text/csv" });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(true);
    });

    it("Given: a valid XLSX file When: parsing Then: should pass validation", () => {
      const file = new File(["xlsx content"], "data.xlsx", {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(true);
    });

    it("Given: a valid XLS file When: parsing Then: should pass validation", () => {
      const file = new File(["xls content"], "data.xls", {
        type: "application/vnd.ms-excel",
      });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(true);
    });

    it("Given: a file exceeding 10MB When: parsing Then: should fail validation", () => {
      const bigContent = new Uint8Array(11 * 1024 * 1024);
      const file = new File([bigContent], "big.csv", { type: "text/csv" });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "imports.errors.fileTooLarge",
        );
      }
    });

    it("Given: a file with invalid extension When: parsing Then: should fail validation", () => {
      const file = new File(["txt content"], "data.txt", {
        type: "text/plain",
      });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "imports.errors.invalidFileType",
        );
      }
    });

    it("Given: a PDF file When: parsing Then: should fail validation", () => {
      const file = new File(["pdf content"], "data.pdf", {
        type: "application/pdf",
      });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(false);
    });

    it("Given: no file provided When: parsing Then: should fail validation", () => {
      const result = importFileSchema.safeParse({});

      expect(result.success).toBe(false);
    });

    it("Given: a non-File value When: parsing Then: should fail validation", () => {
      const result = importFileSchema.safeParse({ file: "not-a-file" });

      expect(result.success).toBe(false);
    });

    it("Given: a file with uppercase extension When: parsing Then: should pass validation", () => {
      const file = new File(["csv content"], "DATA.CSV", { type: "text/csv" });

      const result = importFileSchema.safeParse({ file });

      expect(result.success).toBe(true);
    });
  });

  describe("IMPORT_TYPES", () => {
    it("Given: the constant When: reading Then: should have all five import types", () => {
      expect(IMPORT_TYPES).toHaveLength(5);
    });

    it("Given: the constant When: reading Then: should include PRODUCTS type", () => {
      const products = IMPORT_TYPES.find((t) => t.value === "PRODUCTS");
      expect(products).toBeDefined();
      expect(products?.labelKey).toBe("imports.types.products");
    });

    it("Given: the constant When: reading Then: should include MOVEMENTS type", () => {
      const movements = IMPORT_TYPES.find((t) => t.value === "MOVEMENTS");
      expect(movements).toBeDefined();
      expect(movements?.labelKey).toBe("imports.types.movements");
    });

    it("Given: the constant When: reading Then: should include WAREHOUSES type", () => {
      const warehouses = IMPORT_TYPES.find((t) => t.value === "WAREHOUSES");
      expect(warehouses).toBeDefined();
      expect(warehouses?.labelKey).toBe("imports.types.warehouses");
    });

    it("Given: the constant When: reading Then: should include STOCK type", () => {
      const stock = IMPORT_TYPES.find((t) => t.value === "STOCK");
      expect(stock).toBeDefined();
      expect(stock?.labelKey).toBe("imports.types.stock");
    });

    it("Given: the constant When: reading Then: should include TRANSFERS type", () => {
      const transfers = IMPORT_TYPES.find((t) => t.value === "TRANSFERS");
      expect(transfers).toBeDefined();
      expect(transfers?.labelKey).toBe("imports.types.transfers");
    });
  });
});
