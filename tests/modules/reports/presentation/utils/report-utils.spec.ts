import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCategoryForReportType,
  REPORT_SLUG_MAP,
  slugToReportType,
  reportTypeToSlug,
  formatCellValue,
  formatSummaryKey,
  downloadBlob,
} from "@/modules/reports/presentation/utils/report-utils";
import type { ReportTypeValue } from "@/modules/reports/application/dto/report.dto";

describe("report-utils", () => {
  describe("getCategoryForReportType", () => {
    it("Given an inventory report type, When called, Then returns 'inventory'", () => {
      const result = getCategoryForReportType("AVAILABLE_INVENTORY");

      expect(result).toBe("inventory");
    });

    it("Given a sales report type, When called, Then returns 'sales'", () => {
      const result = getCategoryForReportType("SALES");

      expect(result).toBe("sales");
    });

    it("Given a returns report type, When called, Then returns 'returns'", () => {
      const result = getCategoryForReportType("RETURNS");

      expect(result).toBe("returns");
    });

    it("Given an unknown report type, When called, Then returns 'inventory' as default", () => {
      const result = getCategoryForReportType(
        "NONEXISTENT_TYPE" as ReportTypeValue,
      );

      expect(result).toBe("inventory");
    });
  });

  describe("REPORT_SLUG_MAP", () => {
    it("Given the slug map, When inspected, Then it contains exactly 18 entries", () => {
      expect(Object.keys(REPORT_SLUG_MAP)).toHaveLength(18);
    });

    it("Given the slug map, When inspected, Then each slug maps to a valid ReportTypeValue", () => {
      const expectedEntries: Record<string, ReportTypeValue> = {
        "available-inventory": "AVAILABLE_INVENTORY",
        "movement-history": "MOVEMENT_HISTORY",
        valuation: "VALUATION",
        "low-stock": "LOW_STOCK",
        movements: "MOVEMENTS",
        financial: "FINANCIAL",
        turnover: "TURNOVER",
        sales: "SALES",
        "sales-by-product": "SALES_BY_PRODUCT",
        "sales-by-warehouse": "SALES_BY_WAREHOUSE",
        "sales-by-client": "SALES_BY_CLIENT",
        returns: "RETURNS",
        "returns-by-type": "RETURNS_BY_TYPE",
        "returns-by-product": "RETURNS_BY_PRODUCT",
        "returns-customer": "RETURNS_CUSTOMER",
        "returns-supplier": "RETURNS_SUPPLIER",
        "abc-analysis": "ABC_ANALYSIS",
        "dead-stock": "DEAD_STOCK",
      };

      expect(REPORT_SLUG_MAP).toEqual(expectedEntries);
    });
  });

  describe("slugToReportType", () => {
    it("Given 'available-inventory' slug, When called, Then returns 'AVAILABLE_INVENTORY'", () => {
      const result = slugToReportType("available-inventory");

      expect(result).toBe("AVAILABLE_INVENTORY");
    });

    it("Given 'sales' slug, When called, Then returns 'SALES'", () => {
      const result = slugToReportType("sales");

      expect(result).toBe("SALES");
    });

    it("Given 'abc-analysis' slug, When called, Then returns 'ABC_ANALYSIS'", () => {
      const result = slugToReportType("abc-analysis");

      expect(result).toBe("ABC_ANALYSIS");
    });

    it("Given an unknown slug, When called, Then returns null", () => {
      const result = slugToReportType("nonexistent-slug");

      expect(result).toBeNull();
    });
  });

  describe("reportTypeToSlug", () => {
    it("Given 'AVAILABLE_INVENTORY', When called, Then returns 'available-inventory'", () => {
      const result = reportTypeToSlug("AVAILABLE_INVENTORY");

      expect(result).toBe("available-inventory");
    });

    it("Given 'SALES_BY_PRODUCT', When called, Then returns 'sales-by-product'", () => {
      const result = reportTypeToSlug("SALES_BY_PRODUCT");

      expect(result).toBe("sales-by-product");
    });

    it("Given 'ABC_ANALYSIS', When called, Then returns 'abc-analysis'", () => {
      const result = reportTypeToSlug("ABC_ANALYSIS");

      expect(result).toBe("abc-analysis");
    });
  });

  describe("formatCellValue", () => {
    it("Given null value, When called, Then returns em dash", () => {
      expect(formatCellValue(null, "string")).toBe("\u2014");
    });

    it("Given undefined value, When called, Then returns em dash", () => {
      expect(formatCellValue(undefined, "string")).toBe("\u2014");
    });

    it("Given empty string value, When called, Then returns em dash", () => {
      expect(formatCellValue("", "string")).toBe("\u2014");
    });

    it("Given a number with type 'currency', When called, Then returns formatted currency string", () => {
      const result = formatCellValue(1234.5, "currency", "en-US", "USD");

      expect(result).toBe("$1,234.50");
    });

    it("Given a non-numeric string with type 'currency', When called, Then returns the string as-is", () => {
      const result = formatCellValue("abc", "currency", "en-US", "USD");

      expect(result).toBe("abc");
    });

    it("Given a number with type 'number', When called, Then returns formatted number", () => {
      const result = formatCellValue(9876.543, "number", "en-US");

      expect(result).toBe("9,876.54");
    });

    it("Given a non-numeric string with type 'number', When called, Then returns the string as-is", () => {
      const result = formatCellValue("xyz", "number", "en-US");

      expect(result).toBe("xyz");
    });

    it("Given a number with type 'percentage', When called, Then returns formatted percentage", () => {
      const result = formatCellValue(85.678, "percentage", "en-US");

      expect(result).toBe("85.68%");
    });

    it("Given a non-numeric string with type 'percentage', When called, Then returns the string as-is", () => {
      const result = formatCellValue("notanumber", "percentage", "en-US");

      expect(result).toBe("notanumber");
    });

    it("Given a valid date string with type 'date', When called, Then returns formatted date", () => {
      const result = formatCellValue("2026-01-15T12:00:00", "date", "en-US");

      expect(result).toBe("Jan 15, 2026");
    });

    it("Given an invalid date string with type 'date', When called, Then returns the string as-is", () => {
      const result = formatCellValue("not-a-date", "date", "en-US");

      expect(result).toBe("not-a-date");
    });

    it("Given true with type 'boolean', When called with default labels, Then returns 'Yes'", () => {
      const result = formatCellValue(true, "boolean");

      expect(result).toBe("Yes");
    });

    it("Given false with type 'boolean', When called with default labels, Then returns 'No'", () => {
      const result = formatCellValue(false, "boolean");

      expect(result).toBe("No");
    });

    it("Given true with type 'boolean', When called with custom labels, Then returns custom yes label", () => {
      const result = formatCellValue(true, "boolean", "en-US", undefined, {
        yes: "Active",
        no: "Inactive",
      });

      expect(result).toBe("Active");
    });

    it("Given false with type 'boolean', When called with custom labels, Then returns custom no label", () => {
      const result = formatCellValue(false, "boolean", "en-US", undefined, {
        yes: "Active",
        no: "Inactive",
      });

      expect(result).toBe("Inactive");
    });

    it("Given a value with unknown type, When called, Then returns the stringified value", () => {
      const result = formatCellValue(42, "unknown");

      expect(result).toBe("42");
    });

    it("Given a string value with default type, When called, Then returns the string", () => {
      const result = formatCellValue("hello", "string");

      expect(result).toBe("hello");
    });
  });

  describe("formatSummaryKey", () => {
    it("Given a camelCase key 'totalRevenue', When called, Then returns 'Total Revenue'", () => {
      const result = formatSummaryKey("totalRevenue");

      expect(result).toBe("Total Revenue");
    });

    it("Given a camelCase key 'averageCost', When called, Then returns 'Average Cost'", () => {
      const result = formatSummaryKey("averageCost");

      expect(result).toBe("Average Cost");
    });

    it("Given a single word 'simple', When called, Then returns 'Simple'", () => {
      const result = formatSummaryKey("simple");

      expect(result).toBe("Simple");
    });

    it("Given a snake_case key 'snake_case_key', When called, Then returns 'Snake case key'", () => {
      const result = formatSummaryKey("snake_case_key");

      expect(result).toBe("Snake case key");
    });
  });

  describe("downloadBlob", () => {
    let createObjectURLSpy: ReturnType<typeof vi.fn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURLSpy = vi.fn().mockReturnValue("blob:mock-url");
      revokeObjectURLSpy = vi.fn();
      global.URL.createObjectURL = createObjectURLSpy;
      global.URL.revokeObjectURL = revokeObjectURLSpy;
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("Given a blob and filename, When called, Then creates an anchor element, clicks it, and cleans up", () => {
      const blob = new Blob(["test content"], { type: "text/plain" });
      const clickSpy = vi.fn();
      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = originalCreateElement(tag);
        if (tag === "a") {
          el.click = clickSpy;
        }
        return el;
      });

      downloadBlob(blob, "report.xlsx");

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.tagName).toBe("A");
      expect(anchor.href).toContain("blob:mock-url");
      expect(anchor.download).toBe("report.xlsx");
      expect(clickSpy).toHaveBeenCalledOnce();
      expect(removeChildSpy).toHaveBeenCalledWith(anchor);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    });
  });
});
