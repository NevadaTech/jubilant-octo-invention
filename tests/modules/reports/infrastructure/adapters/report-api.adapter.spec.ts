import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("@/shared/infrastructure/http", () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { apiClient } from "@/shared/infrastructure/http";
import { ReportApiAdapter } from "@/modules/reports/infrastructure/adapters/report-api.adapter";
import type {
  ReportViewResponseDto,
  ReportTypeValue,
  ReportParameters,
} from "@/modules/reports/application/dto/report.dto";

const mockedGet = vi.mocked(apiClient.get);
const mockedPost = vi.mocked(apiClient.post);

function buildViewResponse(
  overrides: Partial<ReportViewResponseDto> = {},
): ReportViewResponseDto {
  return {
    success: true,
    message: "OK",
    data: {
      columns: [
        {
          key: "name",
          header: "Product Name",
          type: "string",
          sortable: true,
        },
        {
          key: "quantity",
          header: "Quantity",
          type: "number",
          sortable: true,
        },
      ],
      rows: [{ name: "Widget A", quantity: 100 }],
      metadata: {
        reportType: "AVAILABLE_INVENTORY",
        reportTitle: "Available Inventory",
        generatedAt: "2026-02-20T10:00:00.000Z",
        totalRecords: 1,
      },
      summary: { totalQuantity: 100 },
    },
    timestamp: "2026-02-20T10:00:00.000Z",
    fromCache: false,
    ...overrides,
  };
}

describe("ReportApiAdapter", () => {
  let adapter: ReportApiAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new ReportApiAdapter();
  });

  describe("viewReport", () => {
    it("Given report type AVAILABLE_INVENTORY, When viewReport is called, Then it calls the correct path and returns columns, rows, metadata", async () => {
      const response = buildViewResponse();
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      const result = await adapter.viewReport("AVAILABLE_INVENTORY");

      expect(mockedGet).toHaveBeenCalledWith(
        "/reports/inventory/available/view",
        { params: {} },
      );
      expect(result.columns).toHaveLength(2);
      expect(result.rows).toHaveLength(1);
      expect(result.metadata.reportType).toBe("AVAILABLE_INVENTORY");
      expect(result.fromCache).toBe(false);
    });

    it("Given report type SALES with parameters, When viewReport is called, Then query params are built and sent", async () => {
      const response = buildViewResponse({
        data: {
          columns: [],
          rows: [],
          metadata: {
            reportType: "SALES",
            reportTitle: "Sales Report",
            generatedAt: "2026-02-20T10:00:00.000Z",
            totalRecords: 0,
          },
        },
      });
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      const params: ReportParameters = {
        dateRange: { startDate: "2026-01-01", endDate: "2026-01-31" },
        warehouseIds: ["wh-1", "wh-2"],
        status: ["CONFIRMED", "COMPLETED"],
        groupBy: "MONTH",
      };

      await adapter.viewReport("SALES", params);

      expect(mockedGet).toHaveBeenCalledWith("/reports/sales/view", {
        params: {
          "dateRange[startDate]": "2026-01-01",
          "dateRange[endDate]": "2026-01-31",
          warehouseId: "wh-1,wh-2",
          status: "CONFIRMED,COMPLETED",
          groupBy: "MONTH",
        },
      });
    });

    it("Given report type ABC_ANALYSIS, When viewReport is called, Then it uses the abc-analysis path", async () => {
      const response = buildViewResponse();
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      await adapter.viewReport("ABC_ANALYSIS", {
        categoryIds: ["cat-1"],
      });

      expect(mockedGet).toHaveBeenCalledWith(
        "/reports/inventory/abc-analysis/view",
        {
          params: { category: "cat-1" },
        },
      );
    });

    it("Given report type DEAD_STOCK with deadStockDays, When viewReport is called, Then deadStockDays is sent as param", async () => {
      const response = buildViewResponse();
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      await adapter.viewReport("DEAD_STOCK", {
        deadStockDays: 120,
        includeInactive: true,
        warehouseIds: ["wh-5"],
      });

      expect(mockedGet).toHaveBeenCalledWith(
        "/reports/inventory/dead-stock/view",
        {
          params: {
            deadStockDays: 120,
            includeInactive: true,
            warehouseId: "wh-5",
          },
        },
      );
    });

    it("Given the response includes fromCache true, When viewReport is called, Then the result reflects the cache status", async () => {
      const response = buildViewResponse({ fromCache: true });
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      const result = await adapter.viewReport("AVAILABLE_INVENTORY");

      expect(result.fromCache).toBe(true);
    });

    it("Given the response includes a summary, When viewReport is called, Then summary is included in the result", async () => {
      const response = buildViewResponse({
        data: {
          columns: [],
          rows: [],
          metadata: {
            reportType: "VALUATION",
            reportTitle: "Valuation",
            generatedAt: "2026-02-20T10:00:00.000Z",
            totalRecords: 0,
          },
          summary: { totalValue: 150000, averageValue: 3000 },
        },
      });
      mockedGet.mockResolvedValue({ data: response, status: 200, headers: {} });

      const result = await adapter.viewReport("VALUATION");

      expect(result.summary).toEqual({
        totalValue: 150000,
        averageValue: 3000,
      });
    });
  });

  describe("exportReport", () => {
    it("Given report type SALES and format EXCEL, When exportReport is called, Then it posts to /export with correct payload", async () => {
      const mockBlob = new Blob(["test data"], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      mockedPost.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      const params: ReportParameters = {
        dateRange: { startDate: "2026-01-01", endDate: "2026-01-31" },
      };
      const options = { includeHeader: true, title: "Sales Export" };

      const result = await adapter.exportReport("SALES", "EXCEL", params, options);

      expect(mockedPost).toHaveBeenCalledWith(
        "/reports/sales/export",
        {
          format: "EXCEL",
          parameters: params,
          options,
          saveMetadata: true,
        },
        { responseType: "blob" },
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it("Given report type RETURNS and format CSV with no options, When exportReport is called, Then options is undefined in payload", async () => {
      const mockBlob = new Blob(["csv,data"]);
      mockedPost.mockResolvedValue({
        data: mockBlob,
        status: 200,
        headers: {},
      });

      await adapter.exportReport("RETURNS", "CSV");

      expect(mockedPost).toHaveBeenCalledWith(
        "/reports/returns/export",
        {
          format: "CSV",
          parameters: undefined,
          options: undefined,
          saveMetadata: true,
        },
        { responseType: "blob" },
      );
    });
  });
});
