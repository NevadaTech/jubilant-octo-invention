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
import {
  DashboardApiService,
  dashboardApiService,
} from "@/modules/dashboard/infrastructure/services/dashboard-api.service";
import type {
  DashboardMetricsDto,
  DashboardMetricsApiResponse,
} from "@/modules/dashboard/application/dto/metrics.dto";

const mockedGet = vi.mocked(apiClient.get);

function buildMetricsDto(
  overrides: Partial<DashboardMetricsDto> = {},
): DashboardMetricsDto {
  return {
    inventory: {
      totalProducts: 150,
      totalStockQuantity: 5000,
      totalInventoryValue: 250000,
      currency: "USD",
    },
    lowStock: {
      count: 12,
    },
    sales: {
      monthlyCount: 45,
      monthlyRevenue: 75000,
      currency: "USD",
    },
    salesTrend: [
      { date: "2026-02-14", count: 5, revenue: 8000 },
      { date: "2026-02-15", count: 7, revenue: 12000 },
      { date: "2026-02-16", count: 3, revenue: 5000 },
    ],
    topProducts: [
      { name: "Widget A", sku: "WA-001", revenue: 15000, quantitySold: 120 },
      { name: "Gadget B", sku: "GB-002", revenue: 12000, quantitySold: 80 },
    ],
    stockByWarehouse: [
      { warehouseName: "Main Warehouse", quantity: 3000, value: 150000 },
      { warehouseName: "Secondary", quantity: 2000, value: 100000 },
    ],
    recentActivity: [
      {
        type: "SALE",
        reference: "SL-0045",
        status: "CONFIRMED",
        description: "Sale confirmed",
        createdAt: "2026-02-20T09:30:00.000Z",
      },
    ],
    ...overrides,
  };
}

function wrapApiResponse(data: DashboardMetricsDto): {
  data: DashboardMetricsApiResponse;
  status: number;
  headers: Record<string, unknown>;
} {
  return {
    data: {
      success: true,
      message: "Dashboard metrics retrieved successfully",
      data,
      timestamp: "2026-02-20T10:00:00.000Z",
    },
    status: 200,
    headers: {},
  };
}

describe("DashboardApiService", () => {
  let service: DashboardApiService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new DashboardApiService();
  });

  describe("getMetrics", () => {
    it("Given dashboard metrics are available, When getMetrics is called, Then it returns the unwrapped DashboardMetricsDto", async () => {
      const metrics = buildMetricsDto();
      mockedGet.mockResolvedValue(wrapApiResponse(metrics));

      const result = await service.getMetrics();

      expect(mockedGet).toHaveBeenCalledWith("/dashboard/metrics");
      expect(result.inventory.totalProducts).toBe(150);
      expect(result.inventory.totalStockQuantity).toBe(5000);
      expect(result.inventory.totalInventoryValue).toBe(250000);
      expect(result.lowStock.count).toBe(12);
      expect(result.sales.monthlyCount).toBe(45);
      expect(result.sales.monthlyRevenue).toBe(75000);
    });

    it("Given dashboard metrics include trend data, When getMetrics is called, Then salesTrend array is correctly returned", async () => {
      const metrics = buildMetricsDto();
      mockedGet.mockResolvedValue(wrapApiResponse(metrics));

      const result = await service.getMetrics();

      expect(result.salesTrend).toHaveLength(3);
      expect(result.salesTrend[0].date).toBe("2026-02-14");
      expect(result.salesTrend[1].revenue).toBe(12000);
    });

    it("Given dashboard metrics include top products and warehouse stock, When getMetrics is called, Then arrays are returned correctly", async () => {
      const metrics = buildMetricsDto();
      mockedGet.mockResolvedValue(wrapApiResponse(metrics));

      const result = await service.getMetrics();

      expect(result.topProducts).toHaveLength(2);
      expect(result.topProducts[0].name).toBe("Widget A");
      expect(result.stockByWarehouse).toHaveLength(2);
      expect(result.stockByWarehouse[0].warehouseName).toBe("Main Warehouse");
      expect(result.recentActivity).toHaveLength(1);
      expect(result.recentActivity[0].type).toBe("SALE");
    });

    it("Given the API call fails, When getMetrics is called, Then the error propagates", async () => {
      mockedGet.mockRejectedValue(new Error("Network error"));

      await expect(service.getMetrics()).rejects.toThrow("Network error");
    });
  });

  describe("module export", () => {
    it("Given the module is imported, When dashboardApiService is accessed, Then it is a pre-instantiated DashboardApiService", () => {
      expect(dashboardApiService).toBeInstanceOf(DashboardApiService);
    });
  });
});
